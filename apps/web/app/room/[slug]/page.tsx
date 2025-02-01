
import axios from "axios";
import { BACKEND_URL } from "./config";
async function getRoom(slug:string){
   const reponse = await axios.get(`${BACKEND_URL}/room/${slug}`);
   return reponse.data.id;
}
export default async function ChatRoom({
    params
}: {
    params: {
        slug: string
    }
}) {
    const slug = (await params).slug;
    const roomId = await getRoom(slug);

return <ChatRoom id={roomId}></ChatRoom>

   
}