import { ActionGetRequest, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions";
import { clusterApiUrl, ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export const GET = async (req: Request) => {
    const payload: ActionGetRequest = {
        icon: new URL("", new URL(req.url).origin).toString(),
        title: "Memo Action",
        description: "An action that adds a memo to a Solana transaction.",
        label: "Add Memo",
    }
    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS
  });
}

export const OPTIONS = GET;

// let's build transaction within the post request

export const POST = async (req: Request, ) => {
  try {

    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (error) {
      return Response.json("Invalid account address", { status: 400});
    }

    const transaction: Transaction = new Transaction();

    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("this is the message", "utf-8"),
        keys: [],
      }));
     
    transaction.feePayer = account;

    const connection = new Connection(clusterApiUrl("devnet"));

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
      }
    })

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS
    })
    
  } catch (error) {
    return Response.json("An unknown error occured", { status: 400});
  }
}