

// "use server";

// import prisma from "@repo/db/client";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth";

// export async function createOnRampTransaction(provider: string, amount: number) {
//     // Ideally the token should come from the banking provider (hdfc/axis)
//     const session = await getServerSession(authOptions);
//     if (!session?.user || !session.user?.id) {
//         return {
//             message: "Unauthenticated request"
//         }
//     }
//     const token = (Math.random() * 1000).toString();
//     await prisma.onRampTransaction.create({
//         data: {
//             provider,
//             status: "Processing",
//             startTime: new Date(),
//             token: token,
//             userId: Number(session?.user?.id),
//             amount: amount * 100
//         }
//     });

//     return {
//         message: "Done"
//     }
// }

"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

// Node fetch is available in Next.js
export async function createOnRampTransaction(provider: string, amount: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user?.id) {
        return {
            message: "Unauthenticated request"
        }
    }

    const token = (Math.random() * 1000).toString();

    // Step 1: Create transaction in DB
    await prisma.onRampTransaction.create({
        data: {
            provider,
            status: "Processing",
            startTime: new Date(),
            token: token,
            userId: Number(session?.user?.id),
            amount: amount * 100
        }
    });

    // Step 2: Immediately notify webhook server
    await fetch("http://localhost:3003/hdfcWebhook", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token,
            user_identifier: session.user.id,   // notice: your webhook expects userId as "user_identifier"
            amount: amount * 100
        })
    });
    // await fetch("https://localhost:3003/hdfcwebhook" ,{
    //     method:"POST",
    //     headers:{
    //         "Content-Type" :"application/json"
    //     },
    //     body:JSON.stringify({
    //         token:token,
    //         user_identifier:session.user.id,
    //         amount:amount*100
    //     })
    // })

    return {
        message: "Transaction initiated, webhook notified",
        token
    }
}
