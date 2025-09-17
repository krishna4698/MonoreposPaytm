import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";

async function gettransfer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { txs: [], userId: 0 };

  const userId = Number(session.user.id); //current user which is logged in
  

  const txs = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        { fromUserId: userId }, // sent by me
        { toUserId: userId }    // received by me
      ]
    },
    include:{
      fromUser:{select:{number:true}},
      toUser:{select:{number:true}}
    }
    // orderBy: { createdAt: "desc" },
  });

  return { txs, userId };
}

export default async function Page() {
  const { txs, userId } = await gettransfer();

  return (
    <div>
      <h2>Recent Transactions</h2>

      {txs.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        txs.map((t) => {
          const isSender = t.fromUserId === userId;
          return (
            <div key={t.id} className="border p-2 my-2 rounded">
              
              {isSender ? (
                <p>📤 Sent ₹{(t.amount)/100} to user {t.toUser.number}</p>
              ) : (
                <p>📥 Received ₹{(t.amount)/100} from user {t.fromUser.number}</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

