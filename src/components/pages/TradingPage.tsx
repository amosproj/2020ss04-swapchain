import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ReactComponent as Key } from "../../icons/key.svg"
import { ReactComponent as LockClosed } from "../../icons/lock-closed.svg"
import { ReactComponent as Collection } from "../../icons/collection.svg"
import { RadioButton } from "../forms/RadioButton"
import { Form } from "../forms/Form"

export const TradingPage = () => {
  enum Operation {
    ACCEPT,
    PROPOSE,
  }

  const [operation, setOperation] = useState(Operation.PROPOSE)

  return (
    <div className="flex flex-col items-center justify-between mt-12 space-y-8 rounded md:space-x-8 md:flex-row md:space-y-0">
      <div className="md:w-8/12">
        <h2 className="mt-2 text-3xl leading-8 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          Our mission
        </h2>
        <p className="mt-4 leading-7 text-gray-700">
    Swapchain’s mission is to create an environment to carry out Atomic Cross-Chain Swaps (ACCS).<br></br>
    The core functionality is the execution of over-the-counter transactions between the Bitcoin and the Bitshares blockchain while making use of Hash Time Locked Contracts (HTLCs).
        </p>
        <ul className="flex flex-col mt-8 space-y-4">
          <li className="flex-grow">
            <div className="flex">
              <div className="flex-shrink-0">
                <Key className="flex items-center justify-center w-8 text-teal-500"></Key>
              </div>
              <div className="ml-4">
                <h4 className="text-lg leading-6 text-gray-600">You own your private keys</h4>
              </div>
            </div>
          </li>
          <li>
            <div className="flex">
              <div className="flex-shrink-0">
                <LockClosed className="flex items-center justify-center w-8 text-teal-500"></LockClosed>
              </div>
              <div className="ml-4">
                <h4 className="text-lg leading-6 text-gray-600">Zero trust required</h4>
              </div>
            </div>
          </li>
          <li>
            <div className="flex">
              <div className="flex-shrink-0">
                <Collection className="flex items-center justify-center w-8 text-teal-500"></Collection>
              </div>
              <div className="ml-4">
                <h4 className="text-lg leading-6 text-gray-600">Trade crypto assets the way you like</h4>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="md:w-4/12">
        <Form
          main={
            <div className="flex flex-col justify-center w-full p-4 space-y-4">
              <div>
                <h2 className="text-xl leading-tight text-gray-900">Start trading</h2>
                <p className="mt-1 text-sm leading-4 text-gray-600">
                  Create a new ACCS or accept an existing proposal from your trading partner.
                </p>
              </div>
              <div className="flex flex-col space-y-4 xl:flex-row xl:space-y-0 xl:space-x-4">
                <RadioButton
                  description="a new Atomic Cross Chain Swap"
                  name="Propose"
                  onClick={() => setOperation(Operation.PROPOSE)}
                  selected={operation === Operation.PROPOSE}
                ></RadioButton>
                <RadioButton
                  description="an Atomic Cross Chain Swap proposal"
                  name="Accept"
                  onClick={() => setOperation(Operation.ACCEPT)}
                  selected={operation === Operation.ACCEPT}
                ></RadioButton>
              </div>
            </div>
          }
          footer={
            <Link
              to={operation === Operation.ACCEPT ? "/accept" : "/propose"}
              className="px-8 py-3 font-semibold text-gray-900 uppercase transition duration-200 ease-in-out bg-white border border-teal-400 rounded-sm shadow-sm focus:outline-none hover:border-teal-500 hover:bg-white"
            >
              Start
            </Link>
          }
        ></Form>
      </div>
    </div>
  )
}
