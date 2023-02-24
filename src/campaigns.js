import React, { useEffect, useState } from "react";
import { getAllCampaigns } from "./solana";
import { serialize, deserialize } from "borsh";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  programId,
  CampaignDetails,
  setPayerAndBlockhashTransaction,
  signAndSendTransaction,
  WithdrawRequest,
} from "./solana";
import * as Web3 from "@solana/web3.js";
import { Buffer } from "buffer";

export const Campaigns = () => {
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();

  const [cards, setCards] = useState([]);
  useEffect(() => {
    getAllCampaigns().then((val) => {
      setCards(val);
      console.log(val);
    });
    window.Buffer = Buffer;
  }, []);

  async function handleDonate(index) {
    if (!connected) {
      alert("Please connect to your wallet");
      return;
    }

    const campaignPubKey = cards[index].pubId;
    const SEED = "abcdef" + Math.random().toString();
    let newAccount = await PublicKey.createWithSeed(publicKey, SEED, programId);
    const amount =
      document.getElementById("donation-amount").value * Web3.LAMPORTS_PER_SOL;
    console.log("amount: ", amount);

    const createProgramAccount = SystemProgram.createAccountWithSeed({
      fromPubkey: publicKey,
      basePubkey: publicKey,
      seed: SEED,
      newAccountPubkey: newAccount,
      lamports: amount,
      space: 1,
      programId: programId,
    });
    let data_to_send = new Uint8Array([2]);

    const instructionTOOurProgram = new TransactionInstruction({
      keys: [
        { pubkey: campaignPubKey, isSigner: false, isWritable: true },
        { pubkey: newAccount, isSigner: false, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false },
      ],
      programId: programId,
      data: data_to_send,
    });

    const trans = await setPayerAndBlockhashTransaction(
      [createProgramAccount, instructionTOOurProgram],
      publicKey,
      connection
    );
    const signature = await signAndSendTransaction(
      trans,
      signTransaction,
      connection
    );
    const result = await connection.confirmTransaction(signature);
    document.location.reload(true);
    console.log("end sendMessage", result);
  }

  async function handleWithdraw(index) {
    const amount =
      document.getElementById("withdraw-amount").value * Web3.LAMPORTS_PER_SOL;
    const campaignPubKey = cards[index].pubId;
    let withdrawRequest = new WithdrawRequest({ amount: amount });
    let data = serialize(WithdrawRequest.schema, withdrawRequest);
    let data_to_send = new Uint8Array([1, ...data]);
    const instructionTOOurProgram = new TransactionInstruction({
      keys: [
        { pubkey: campaignPubKey, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true },
      ],
      programId: programId,
      data: data_to_send,
    });
    const trans = await setPayerAndBlockhashTransaction(
      [instructionTOOurProgram],
      publicKey,
      connection
    );
    const signature = await signAndSendTransaction(
      trans,
      signTransaction,
      connection
    );
    const result = await connection.confirmTransaction(signature);
    console.log(result);
    document.location.reload(true);
  }

  async function getAllCampaigns() {
    let accounts = await connection.getProgramAccounts(programId);
    let campaigns = [];
    accounts.forEach((e) => {
      try {
        let campData = deserialize(
          CampaignDetails.schema,
          CampaignDetails,
          e.account.data
        );
        campaigns.push({
          pubId: e.pubkey,
          name: campData.name,
          description: campData.description,
          image_link: campData.image_link,
          amount_donated: campData.amount_donated,
          admin: campData.admin,
        });
      } catch (err) {
        console.log(err);
      }
    });
    return campaigns;
  }

  return (
    <section className="grid grid-cols-3 gap-x-4 gap-y-4">
      {cards.map((card, index) => (
        <div className="border-2 border-gray-300 rounded-md flex flex-col gap-4 p-4">
          <h1 className="text-xl mx-auto font-semibold">
            {card.name.toUpperCase()}
          </h1>
          <img src={card.image_link} alt="campaign image" />
          <p className="italic">{card.description}</p>
          <div className="font-semibold text-l my-4">
            Total Amount Funded:{" "}
            {card.amount_donated.toString() / Web3.LAMPORTS_PER_SOL} SOL
          </div>

          <div className="mt-auto flex flex-row gap-4 justify-between">
            <input
              className="border-2 border-gray-400 rounded-md py-2 px-2 w-2/3"
              type="text"
              placeholder="Donation Amount"
              id="donation-amount"
            />
            <button
              onClick={() => {
                handleDonate(index);
              }}
              className="cursor-pointer  bg-yellow-400 rounded-md p-4 font-semibold text-xl"
            >
              Donate
            </button>
          </div>
          <div className=" flex flex-row gap-4 justify-between">
            <input
              className="border-2 border-gray-400 rounded-md py-2 px-2 w-2/3"
              type="text"
              placeholder="Withdraw Amount"
              id="withdraw-amount"
            />
            <button
              onClick={() => {
                handleWithdraw(index);
              }}
              className="cursor-pointer  bg-yellow-400 rounded-md py-4 font-semibold text-l px-3"
            >
              Withdraw
            </button>
          </div>
        </div>
      ))}
    </section>
  );
};
