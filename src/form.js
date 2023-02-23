import React from "react";
import { createCampaign } from "./solana";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { deserialize, serialize } from "borsh";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { programId, CampaignDetails } from "./solana";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";

export const CreateCampaignForm = () => {
  const navigate = useNavigate();
  window.Buffer = Buffer;
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, signTransaction } =
    useWallet();

  const onSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const image = document.getElementById("img-link").value;
    console.log(name, description, image);
    await createCampaign(name, description, image);
    navigate("/");
  };

  async function setPayerAndBlockhashTransaction(instructions) {
    const transaction = new Transaction();
    instructions.forEach((element) => {
      transaction.add(element);
    });
    transaction.feePayer = publicKey;
    let hash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = hash.blockhash;
    return transaction;
  }

  async function signAndSendTransaction(transaction) {
    try {
      console.log("start signAndSendTransaction");

      let signedTrans = await signTransaction(transaction);
      console.log("signed transaction");
      let signature = await connection.sendRawTransaction(
        signedTrans.serialize()
      );
      console.log("end signAndSendTransaction");
      return signature;
    } catch (err) {
      console.log("signAndSendTransaction error", err);
      throw err;
    }
  }

  async function createCampaign(name, description, image_link) {
    if (!connected) {
      alert("You are not connected to wallet!");
      return;
    }

    const SEED = "abcdef" + Math.random().toString();
    let newAccount = await PublicKey.createWithSeed(publicKey, SEED, programId);

    let campaign = new CampaignDetails({
      name: name,
      description: description,
      image_link: image_link,
      admin: publicKey.toBuffer(),
      amount_donated: 0,
    });
    console.log(campaign);
    let data = serialize(CampaignDetails.schema, campaign);
    let data_to_send = new Uint8Array([0, ...data]);

    const lamports = await connection.getMinimumBalanceForRentExemption(
      data.length
    );

    const createProgramAccount = SystemProgram.createAccountWithSeed({
      fromPubkey: publicKey,
      basePubkey: publicKey,
      seed: SEED,
      newAccountPubkey: newAccount,
      lamports: lamports,
      space: data.length,
      programId: programId,
    });

    const instructionTOOurProgram = new TransactionInstruction({
      keys: [
        { pubkey: newAccount, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: false },
      ],
      programId: programId,
      data: data_to_send,
    });

    const trans = await setPayerAndBlockhashTransaction([
      createProgramAccount,
      instructionTOOurProgram,
    ]);
    const signature = await signAndSendTransaction(trans);
    const result = await connection.confirmTransaction(signature);
    console.log("end sendMessage", result);
  }
  return (
    <form className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <label className="text-xl font-semibold" htmlFor="title">
          Title
        </label>
        <input
          className="border-2 border-gray-500 bg-white text-black rounded-md p-2"
          type="text"
          id="title"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xl font-semibold" htmlFor="description">
          Description
        </label>
        <input
          className="border-2 border-gray-500 bg-white text-black rounded-md p-2"
          type="text"
          id="description"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xl font-semibold" htmlFor="img-link">
          Image Link
        </label>
        <input
          className="border-2 border-gray-500 bg-white text-black rounded-md p-2"
          type="text"
          id="img-link"
        />
      </div>
      <button
        className="border-4 border-yellow-500 w-48 mx-auto px-2 py-4 text-xl font-semibold rounded-md cursor-pointer"
        onClick={onSubmit}
      >
        Create Campaign
      </button>
    </form>
  );
};
