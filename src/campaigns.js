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
import { programId, CampaignDetails } from "./solana";

export const Campaigns = () => {
  const { connection } = useConnection();

  const [cards, setCards] = useState([]);
  useEffect(() => {
    getAllCampaigns().then((val) => {
      setCards(val);
      console.log(val);
    });
  }, []);

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

  console.log(cards);
  return (
    <section className="grid grid-cols-3 gap-x-4 gap-y-4">
      {cards.map((card) => (
        <div className="border-2 border-gray-300 rounded-md flex flex-col gap-4 p-4">
          <h1 className="text-xl mx-auto font-semibold">
            {card.name.toUpperCase()}
          </h1>
          <img src={card.image_link} alt="campaign image" />
          <p className="italic">{card.description}</p>
        </div>
      ))}
    </section>
  );
};
