const samples = {
  "Team meeting": `#Person1#: Hi Rafi, are you coming to the team meeting at 3 pm?
#Person2#: I can't, my bus broke down near Farmgate. I'll be at least an hour late.
#Person1#: No problem. Should I record the meeting for you?
#Person2#: Yes please, and send me the slides too.
#Person1#: Sure, I'll email everything after the meeting.`,
  "Doctor visit": `#Person1#: Good morning. What seems to be the problem?
#Person2#: I've had a sore throat and a mild fever for three days.
#Person1#: Let me check. Your throat is quite red. Have you been drinking enough water?
#Person2#: Not really, I've been busy with exams.
#Person1#: Rest for a few days, drink warm water, and take this medicine twice a day. Come back if the fever goes above 102.
#Person2#: Thank you, doctor.`,
  "Online order": `#Person1#: Hello, I ordered a blue backpack last week but received a black one.
#Person2#: I'm sorry about that. Can you share your order number?
#Person1#: It's 45821.
#Person2#: Thanks. I can send the blue one tomorrow, and our courier will collect the black one at the same time.
#Person1#: That works. Will I have to pay for delivery?
#Person2#: No, the exchange is completely free.`,
};

const $ = (id) => document.getElementById(id);
const textarea = $("dialogue");
const button = $("summarizeBtn");

for (const [name, text] of Object.entries(samples)) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = name;
  b.addEventListener("click", () => { textarea.value = text; updateCount(); });
  $("samples").append(b);
}

function updateCount() {
  $("charCount").textContent = `${textarea.value.length} characters`;
}
textarea.addEventListener("input", updateCount);
$("length").addEventListener("input", (e) => { $("lengthValue").textContent = e.target.value; });

async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    const status = $("status");
    status.textContent = data.modelReady
      ? `Model ready: ${data.model} (${data.dtype})`
      : `Loading model ${data.model}… first load can take a minute.`;
    status.classList.toggle("ready", data.modelReady);
    if (!data.modelReady) setTimeout(checkHealth, 3000);
  } catch {
    $("status").textContent = "Server not reachable.";
  }
}

button.addEventListener("click", async () => {
  $("error").hidden = true;
  button.disabled = true;
  button.textContent = "Summarizing…";
  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textarea.value, maxTokens: Number($("length").value) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    $("summary").textContent = data.summary;
    $("meta").textContent = `Generated in ${data.ms} ms by ${data.model}`;
    $("resultCard").hidden = false;
  } catch (err) {
    $("error").textContent = err.message;
    $("error").hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Summarize";
  }
});

updateCount();
checkHealth();
