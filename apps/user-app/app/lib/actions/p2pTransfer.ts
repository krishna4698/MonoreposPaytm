// "use server"
// import prisma from "@repo/db/client";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth";

// export async function p2ptransfer( to:string , amount: number){

//     const session=await getServerSession(authOptions);
//     const from =session?.user?.id
//     if(!from){
//         return {
//             message : "please login  first"
//         }
//     };
//     const touser=await prisma.user.findFirst({
//         where:{
//             number:to
//         }
//     });
//     if(!touser){
//         return {
//             message:"user does not exist"
//         }
//     }

//     await prisma.$transaction(async(tx)=>{
//         await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId"=${Number(from)} FOR UPDATE `
//     const fromBalance=await tx.balance.findUnique({
//         where:{userId:Number(from)}
//     })
  
//              if (!fromBalance || fromBalance.amount < amount) {
//             throw new Error('Insufficient funds');
//           }
//           await tx.balance.update({
//             where:{userId:Number(from)},
//             data:{amount:{decrement:amount}}
//           })
//           await tx.balance.update({
//             where:{userId:touser.id},
//             data:{amount:{increment:amount}}
//           })

//     })
// }

"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client";

export async function p2ptransfer(to:string, amount :number){
    
    const session=await getServerSession(authOptions);
   const from=session?.user?.id;
   if(!from){
    return {
        message:"login in first"
    }
   }
   const touser=await prisma.user.findFirst({
    where:{
       number:to
    }
   })
   if(!touser){
    return {
        message :"user does not exist"
    }
   }


   await prisma.$transaction(async(tx)=>{
     await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
         const balance= await tx.balance.findUnique({
            where:{userId:Number(from)}
         })
        //   console.log("before");
         
        //  await new Promise(r=> setTimeout(r,4000))
        //  console.log("after");
         if(!balance || balance.amount < amount){
            throw new Error("insufficient funds")
            
         }
        
         
          await tx.balance.update({
             where:{userId:Number(from)},
             data:{amount:{decrement:amount}}
          })

          await tx.balance.update({
            where:{userId:touser.id},
            data:{amount:{increment:amount}}
          })
          await tx.p2pTransfer.create({
            data:{
               fromUserId:Number(from),
               toUserId:touser.id,
               amount,
               timestamp: new Date()
            }
          })
   })


}