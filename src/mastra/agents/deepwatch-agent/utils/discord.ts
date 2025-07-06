const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1391435394913927201/SpbiKxygl5f8LWzwpCh8w-eGgyVn0v3JJk2xqeLKfGeVMNFw0NdeZ_Wwn0u3Rhe6G2i9";

export async function sendDiscordAlert(message: string): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) return;
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message })
  });
} 