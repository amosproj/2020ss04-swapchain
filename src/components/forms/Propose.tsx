import React, { useState, useEffect } from "react"
import { fakeKey } from "../../util"
import { RadioButton } from "./RadioButton"
import { Label } from "./Label"
import { Input } from "./Input"
import { SubmitButton } from "./SubmitButton"
import { ReactComponent as Exclamation } from "../../icons/exclamation.svg"
import { Form } from "./Form"
import { Spinner } from "../Spinner"
import { State, Currency, Network, Timelock, Priority } from "./enums"
import {
  isValidBitcoinPrivateKey,
  isValidBitsharesPrivateKey,
  isValidBitcoinPublicKey,
} from "../../pkg/address/validator"
import ACCS from "../../accs/accs"
import { getSecret } from "../../pkg/secret/secret"
import { toPublicKey } from "../../util"

export const Propose = () => {
  // Application stae for handling the flow
  const [state, setState] = useState(State.IDLE)
  const [isValid, setValid] = useState(false)

  // Used to display helpful error messages to the user
  const [errorMessage, setErrorMessage] = useState("")

  // Collects the user input in one place
  const [fields, setFields] = useState({
    mode: "proposer",
    networkToTrade: Network.TESTNET,
    currencyToGive: Currency.BTC,
    amountToSend: 1,
    rate: 1,
    amountToReceive: 1,
    bitcoinPrivateKey: "cVPwsbE8HNMCoLGz8N4R2SfyQTMQzznL9x3vEHJqPtuZ1rhBkTo7",
    bitsharesPrivateKey: "5Z89Ve18ttnu7Ymd1nnCMsnGkfKk4KQnsfFrYEz7Cmw39FAMOSS",
    counterpartyBitcoinPublicKey: "034c7ddacc16fa5e53aa5dc19748e3877ba07b981fdbbcdb97b8b19de240241f61",
    counterpartyBitsharesAccountName: "amos",
    bitcoinTxID: "",
    timelock: Timelock.SHORT,
    priority: Priority.HIGH,
    secret: getSecret(),
  })

  /**
   * Get the unit of the rate multiplier.
   * @returns Either BTC/BTS or BTS/BTC
   */
  const rateUnit = (): string[] => {
    switch (fields.currencyToGive) {
      case Currency.BTC:
        return ["BTC", "BTS"]
      case Currency.BTS:
        return ["BTS", "BTC"]
    }
  }

  //calculate received funds
  useEffect(() => {
    if (fields.amountToReceive !== fields.amountToSend * fields.rate) {
      setFields({
        ...fields,
        amountToReceive: fields.amountToSend * fields.rate,
      })
    }
  }, [fields])

  /**
   * Validate all fields.
   * @returns The respective error messsage or empty string if valid.
   */
  const validate = (): string => {
    if (fields.amountToSend <= 0) {
      return "Amount to send is empty"
    }
    if (fields.rate <= 0) {
      return "Rate is less than 0"
    }
    if (fields.amountToReceive <= 0) {
      return "Amount you receive is less than 0"
    }
    if (!isValidBitcoinPrivateKey(fields.bitcoinPrivateKey, fields.networkToTrade)) {
      return "Bitcoin private key is invalid"
    }
    if (!isValidBitsharesPrivateKey(fields.bitsharesPrivateKey)) {
      return "Bitshares private key is invalid"
    }
    if (!isValidBitcoinPublicKey(fields.counterpartyBitcoinPublicKey)) {
      return "Counterparty bitcoin public key is invalid"
    }
    if (fields.counterpartyBitsharesAccountName === "") {
      return "Counterparty bitshares account name is empty"
    }
    if (fields.bitcoinTxID.length !== 64) {
      return "Bitcoin Transaction ID to spend is not 64 chars long"
    }
    return ""
  }

  // Go back to idle when the user fixes their input errors.
  // Does nothing if the accs is already running
  useEffect(() => {
    if (state === State.ERROR && isValid) {
      setErrorMessage("")
      setState(State.IDLE)
    }
  }, [fields, state, isValid])

  /**
   * Update the field state from a FormEvent
   * @param e - HTMLInput FormEvent.
   */
  const updateField = (e: React.FormEvent<HTMLInputElement>) => {
    setFields({
      ...fields,
      [e.currentTarget.name]: e.currentTarget.value,
    })
  }
  /**
   * Update the field state manually via onClick for example.
   * @param key - The key in the field state.
   * @param value - New value to be stored.
   */
  const updateFieldByKey = (key: string, value: number | string) => {
    setFields({
      ...fields,
      [key]: value,
    })
  }

  /**
   * This hook handles the SubmitButton.
   * When a user thinks he is done filling out the form it is validated first and feedback is given to the user.
   */
  const submitHandler = async () => {
    const errorMessage = validate()
    setValid(errorMessage === "")

    // Checking "manually" because the state is updated asynchronously
    if (errorMessage !== "") {
      setErrorMessage(errorMessage)
      setState(State.ERROR)
      return
    }

    setState(State.RUNNING)

    ACCS.run(fields)
      .then(() => {
        setState(State.SUCCESS)
      })
      .catch((err) => {
        setState(State.FAILURE)
        setErrorMessage(err.toString())
      })
  }

  const formFields = (
    <div className="flex flex-col mt-12 space-y-10">
      <section>
        <Label label="On what network do you want to trade"></Label>
        <div className="flex flex-col justify-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <RadioButton
            description="You are sending real money!"
            name="Mainnet"
            tag={
              <Exclamation
                className={`h-8 text-red-600 ${fields.networkToTrade === Network.MAINNET ? "" : "hidden"}`}
              ></Exclamation>
            }
            onClick={() => updateFieldByKey("networkToTrade", Network.MAINNET)}
            selected={fields.networkToTrade === Network.MAINNET}
          ></RadioButton>
          <RadioButton
            description="Send test currencies on the testnet"
            name="Testnet"
            onClick={() => updateFieldByKey("networkToTrade", Network.TESTNET)}
            selected={fields.networkToTrade === Network.TESTNET}
          ></RadioButton>
        </div>
      </section>

      <section>
        <Label label="What do you want to trade"></Label>
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <RadioButton
            description="You are giving Bitcoin away"
            name="Bitcoin"
            onClick={() => updateFieldByKey("currencyToGive", Currency.BTC)}
            selected={fields.currencyToGive === Currency.BTC}
            tag="BTC"
          ></RadioButton>
          <RadioButton
            description="You are giving Bitshares away"
            name="Bitshares"
            onClick={() => updateFieldByKey("currencyToGive", Currency.BTS)}
            selected={fields.currencyToGive === Currency.BTS}
            tag="BTS"
          ></RadioButton>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold leading-tight text-gray-800">Amount</h2>
        <div className="items-center justify-between mt-4 md:space-x-4 md:flex">
          <div className="flex-grow">
            <Label label="Amount to send"></Label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center mr-6 text-sm text-gray-600">
                {rateUnit()[0]}
              </span>
              <Input
                min={0}
                name="amountToSend"
                onChange={updateField}
                placeholder="0.00000000"
                step={0.00000001}
                type="number"
                value={fields.amountToSend}
              ></Input>
            </div>
          </div>
          <div className="flex-grow">
            <Label label="Rate"></Label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center mr-6 text-xs text-gray-600">
                <span>{rateUnit()[1]}</span>
                <span className="border-t border-gray-500">{rateUnit()[0]}</span>
              </div>
              <Input
                min={0}
                name="rate"
                onChange={updateField}
                placeholder="0.0000"
                step={0.00000001}
                type="number"
                value={fields.rate}
              ></Input>
            </div>
          </div>
          <div className="flex-grow">
            <Label label="excluding fees you will receive"></Label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center mr-6 text-sm text-gray-600">
                {rateUnit()[1]}{" "}
              </span>
              <span className="block w-full py-3 font-mono text-center text-gray-700 border border-gray-200 rounded focus:border-teal-500">
                {fields.amountToReceive}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold leading-tight text-gray-800">Your Data</h2>
        <div className="items-center justify-between mt-4 md:space-x-4 md:flex">
          <div className="md:w-1/2">
            <Label label="Bitcoin private key"></Label>
            <Input
              name="bitcoinPrivateKey"
              onChange={updateField}
              placeholder={fakeKey(30, fields.networkToTrade)}
              type="text"
              value={fields.bitcoinPrivateKey}
            ></Input>
          </div>
          <div className="md:w-1/2">
            <Label label="Bitshares private key"></Label>
            <Input
              name="bitsharesPrivateKey"
              onChange={updateField}
              placeholder={"5" + fakeKey(30, fields.networkToTrade)}
              type="text"
              value={fields.bitsharesPrivateKey}
            ></Input>
          </div>
        </div>
        <p className="px-4 mx-auto mt-2 text-sm text-center text-gray-500">
          Your public Bitcoin key and Bitshares account name can be derived from your private key. Your private keys
          will never leave your browser, they are only used to sign your transactions.{" "}
          <a href="/" className="relative text-xs text-blue-500">
            Read more in our docs.
          </a>
        </p>
        <div>
          <Label label="Bitcoin transaction ID to spend"></Label>
          <Input
            name="bitcoinTxID"
            onChange={updateField}
            placeholder={fakeKey(30, "testnet")}
            type="text"
            value={fields.bitcoinTxID}
          ></Input>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold leading-tight text-gray-800">Counterparty Data</h2>
        <div className="items-center justify-between mt-4 md:space-x-4 md:flex">
          <div className="md:w-1/2">
            <Label label="Bitcoin public key"></Label>
            <Input
              name="counterpartyBitcoinPublicKey"
              onChange={updateField}
              placeholder={"02" + fakeKey(30, fields.networkToTrade)}
              type="text"
              value={fields.counterpartyBitcoinPublicKey}
            ></Input>
          </div>
          <div className="md:w-1/2">
            <Label label="Bitshares account name"></Label>
            <Input
              name="counterpartyBitsharesAccountName"
              onChange={updateField}
              placeholder="amos"
              type="text"
              value={fields.counterpartyBitsharesAccountName}
            ></Input>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold leading-tight text-gray-800">HTLC settings</h2>
        <div className="mt-4">
          <Label label="Choose your timelock"></Label>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <RadioButton
              description="Around 1 hour. This is the shortest duration possible while making sure the transactions are confirmed in time."
              hint={Timelock.SHORT + " blocks"}
              name={Timelock[Timelock.SHORT]}
              onClick={() => updateFieldByKey("timelock", Timelock.SHORT)}
              selected={fields.timelock === Timelock.SHORT}
            ></RadioButton>
            <RadioButton
              description="Around 2 hours. Offers more time for the counterparty to come online."
              hint={Timelock.MEDIUM + " blocks"}
              name={Timelock[Timelock.MEDIUM]}
              onClick={() => updateFieldByKey("timelock", Timelock.MEDIUM)}
              selected={fields.timelock === Timelock.MEDIUM}
            ></RadioButton>
            <RadioButton
              description="Around 3 hours. Gives your counterparty even more time."
              hint={Timelock.LONG + " blocks"}
              name={Timelock[Timelock.LONG]}
              onClick={() => updateFieldByKey("timelock", Timelock.LONG)}
              selected={fields.timelock === Timelock.LONG}
            ></RadioButton>
          </div>
          <p className="px-4 mx-auto mt-2 text-sm text-center text-gray-500">
            By design one block should equal 10 minutes. However it can differ quite a lot in reality. We suggest
            leaving this at SHORT and scheduling with your counterparty accordingly. Please make sure you tell your
            trading partner what you chose because these values must match.
          </p>
        </div>
      </section>

      <section>
        <Label label="Choose your priority"></Label>
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <RadioButton
            description="You pay the highest fees to increase the chance for your transaction to be picked up by the miners."
            name={Priority[Priority.HIGH]}
            onClick={() => updateFieldByKey("priority", Priority.HIGH)}
            selected={fields.priority === Priority.HIGH}
          ></RadioButton>
          <RadioButton
            description="You pay a moderate amount of fees so miners will probably confirm your transaction soon."
            name={Priority[Priority.MEDIUM]}
            onClick={() => updateFieldByKey("priority", Priority.MEDIUM)}
            selected={fields.priority === Priority.MEDIUM}
          ></RadioButton>
          <RadioButton
            description="You pay the lowest fees but might have to wait a few more blocks for your transaction to be confirmed."
            name={Priority[Priority.LOW]}
            onClick={() => updateFieldByKey("priority", Priority.LOW)}
            selected={fields.priority === Priority.LOW}
          ></RadioButton>
        </div>
      </section>
    </div>
  )
  const submit = <SubmitButton borderColor="teal" label="Submit" onClick={submitHandler}></SubmitButton>
  const running = (
    <div className="flex flex-col items-center justify-center">
      <Spinner className="h-40"></Spinner>
      <div>
        <section className="px-3 py-2">
          <Label label="Your secret hash"></Label>
          <p className="p-3 font-mono text-center text-teal-900 break-all border border-teal-400 rounded">
            {fields.secret.hash.toString("hex")}
          </p>
        </section>
        <section className="px-3 py-2">
          <Label label="Your Bitcoin public key"></Label>
          <p className="p-3 font-mono text-center text-teal-900 break-all border border-teal-400 rounded">
            {toPublicKey(fields.bitcoinPrivateKey)}
          </p>
        </section>
        <section className="px-3 py-2">
          <Label label="Your timelock duration"></Label>
          <p className="p-3 font-mono font-bold text-center text-teal-900 break-all border border-teal-400 rounded">
            {Timelock[fields.timelock]}
          </p>
        </section>
      </div>
    </div>
  )

  return (
    <Form
      main={
        <div className="flex flex-col justify-center w-full p-8">
          <h2 className="text-3xl font-semibold leading-tight text-gray-800 ">Propose a new Atomic Cross Chain Swap</h2>
          {(function () {
            switch (state) {
              case State.IDLE:
                return formFields
              case State.ERROR:
                return formFields
              case State.RUNNING:
                return running
              case State.SUCCESS:
                return (
                  <div className="flex items-center justify-center mt-8">
                    <p className="py-4 text-xl font-bold text-teal-400 uppercase">success</p>
                  </div>
                )
              case State.FAILURE:
                return (
                  <div className="flex items-center justify-center mt-8">
                    <p className="py-4 text-xl font-bold text-red-500 uppercase">failure</p>
                  </div>
                )
            }
          })()}
        </div>
      }
      footer={
        <div>
          {(function () {
            switch (state) {
              case State.IDLE:
                return submit
              case State.ERROR:
                return <p className="py-4 font-bold text-red-500">{errorMessage}</p>
              case State.RUNNING:
                return <p className="py-4 font-bold text-gray-700">Please give these to your trading partner.</p>
              case State.SUCCESS:
                return <p className="py-4 font-bold text-gray-700">Thank you for using swapchain.</p>
              case State.FAILURE:
                return <p className="py-4 font-bold text-gray-700">{errorMessage}</p>
            }
          })()}
        </div>
      }
    ></Form>
  )
}
