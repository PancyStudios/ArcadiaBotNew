import { Event } from "../../structures/Event.js";

export default new Event('warn', async(info) => {
    console.warn(info);
})