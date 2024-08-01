import { Event } from "../../structures/Event";

export default new Event('warn', async(info) => {
    console.warn(info);
})