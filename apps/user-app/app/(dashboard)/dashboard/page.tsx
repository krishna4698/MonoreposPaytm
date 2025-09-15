import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import prisma from "@repo/db/client";


async function getdetail(){
      const session=await  getServerSession(authOptions);
        const info=await prisma.user.findUnique({
            where:{
                id:Number(session?.user?.id)
            },
            select:{

                number:true
            }
            
        })
        return info;
}
export default  async function() {
  const a=await getdetail();

    return <div>
         Dashboard 
        {a ? <p> your number :{a.number}</p>: "not found"}
    </div>
}