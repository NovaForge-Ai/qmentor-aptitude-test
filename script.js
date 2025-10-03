import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


let userId = null;

const questions = [
  {
    q_en: "I enjoy solving complex problems that require a lot of thinking. 🧠",
    q_ml: "സങ്കീർണ്ണമായ പ്രശ്നങ്ങൾക്ക് പരിഹാരം കാണാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 🧠",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I prefer working with my hands to build or fix things. 🛠️",
    q_ml: "കൈകൊണ്ട് കാര്യങ്ങൾ ഉണ്ടാക്കാനും നന്നാക്കാനും ഞാൻ ഇഷ്ടപ്പെടുന്നു. 🛠️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I like to organize and plan events down to the last detail. 📋",
    q_ml: "ഒരു കാര്യത്തിന്റെ എല്ലാ വിശദാംശങ്ങളും കൃത്യമായി ആസൂത്രണം ചെയ്യാനും ക്രമീകരിക്കാനും ഞാൻ ഇഷ്ടപ്പെടുന്നു. 📋",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am often the one who comforts a friend when they are sad. ❤️",
    q_ml: "ഒരു കൂട്ടുകാരൻ വിഷമിച്ചിരിക്കുമ്പോൾ, അവരെ ആശ്വസിപ്പിക്കുന്നത് ഞാൻ തന്നെയാണ്. ❤️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "Which task seems more interesting to you? 🤔",
    q_ml: "നിങ്ങൾക്ക് കൂടുതൽ താൽപ്പര്യമുള്ള ജോലി ഏതാണ്? 🤔",
    options: [
      {
        text_en: "Writing a long report with lots of facts and figures.",
        text_ml:
          "വസ്തുതകളും കണക്കുകളും ഉൾപ്പെടുത്തി ഒരു റിപ്പോർട്ട് എഴുതുക.",
        score: { U: 1, C: 1 },
      },
      {
        text_en: "Designing a new product.",
        text_ml: "ഒരു പുതിയ ഉൽപ്പന്നം രൂപകൽപ്പന ചെയ്യുക.",
        score: { J: 1 },
      },
    ],
  },
  {
    q_en: "I feel calm and focused when under pressure. 🧘",
    q_ml: "സമ്മർദ്ദമുള്ള സാഹചര്യങ്ങളിൽ ഞാൻ ശാന്തവും ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്ന ആളുമാണ്. 🧘",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at convincing others to agree with my ideas. 🗣️",
    q_ml: "എന്റെ ആശയങ്ങൾ മറ്റുള്ളവരെ അംഗീകരിപ്പിക്കാൻ എനിക്ക് കഴിവുണ്ട്. 🗣️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am very careful and precise when doing school assignments. ✍️",
    q_ml: "സ്കൂളിലെ ജോലികൾ ചെയ്യുമ്പോൾ ഞാൻ വളരെ ശ്രദ്ധയോടെയും കൃത്യതയോടെയും ചെയ്യും. ✍️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "Which career appeals to you more? 🧑‍💼",
    q_ml: "നിങ്ങൾക്ക് കൂടുതൽ താൽപ്പര്യമുള്ള തൊഴിൽ ഏതാണ്? 🧑‍💼",
    options: [
      {
        text_en: "Working in a research lab to find new discoveries.",
        text_ml:
          "പുതിയ കണ്ടുപിടിത്തങ്ങൾക്കായി ഒരു ഗവേഷണ ലബോറട്ടറിയിൽ പ്രവർത്തിക്കുക.",
        score: { N: 1, J: 1 },
      },
      {
        text_en: "Managing a team of people.",
        text_ml: "ഒരു ടീമിനെ നയിക്കുക.",
        score: { U: 1 },
      },
    ],
  },
  {
    q_en: "I find it easy to understand how other people are feeling. 🥰",
    q_ml: "മറ്റുള്ളവരുടെ വികാരങ്ങൾ എളുപ്പത്തിൽ മനസ്സിലാക്കാൻ എനിക്ക് സാധിക്കാറുണ്ട്. 🥰",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "Which subject do you enjoy more? 📚",
    q_ml: "ഏത് വിഷയമാണ് നിങ്ങൾ കൂടുതൽ ഇഷ്ടപ്പെടുന്നത്? 📚",
    options: [
      {
        text_en: "Mathematics and logical puzzles.",
        text_ml: "ഗണിതവും ലോജിക്കൽ പസിലുകളും.",
        score: { J: 1, C: 1 },
      },
      {
        text_en: "Biology and human anatomy.",
        text_ml: "ബയോളജിയും മനുഷ്യ ശരീരശാസ്ത്രവും.",
        score: { N: 1 },
      },
    ],
  },
  {
    q_en: "I enjoy debating and presenting arguments. 💬",
    q_ml: "സംവാദങ്ങളിലും ചർച്ചകളിലും പങ്കെടുക്കാൻ എനിക്ക് ഇഷ്ടമാണ്. 💬",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I like to keep a detailed budget of my money. 💰",
    q_ml: "എന്റെ പണത്തിന്റെ കണക്കുകൾ കൃത്യമായി സൂക്ഷിക്കാൻ ഞാൻ ഇഷ്ടപ്പെടുന്നു. 💰",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am interested in how society works and what is happening in the world. 🌍",
    q_ml: "സമൂഹത്തെക്കുറിച്ചും ലോകത്ത് നടക്കുന്ന കാര്യങ്ങളെക്കുറിച്ചും അറിയാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 🌍",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I prefer to work alone on a task rather than in a group. 🚶",
    q_ml: "ഒരു ജോലി ഒറ്റയ്ക്ക് ചെയ്യുന്നത് ഗ്രൂപ്പായി ചെയ്യുന്നതിനേക്കാൾ ഞാൻ ഇഷ്ടപ്പെടുന്നു. 🚶",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am fascinated by human diseases and the healthcare system. ⚕️",
    q_ml: "മനുഷ്യരോഗങ്ങളെക്കുറിച്ചും ആരോഗ്യ സംവിധാനത്തെക്കുറിച്ചും അറിയാൻ എനിക്ക് ജിജ്ഞാസയുണ്ട്. ⚕️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at fixing broken electronics or machines. 💻",
    q_ml: "കേടായ ഇലക്ട്രോണിക് ഉപകരണങ്ങൾ നന്നാക്കാൻ എനിക്ക് കഴിവുണ്ട്. 💻",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I pay close attention to the financial details of a family trip or a project. 💼",
    q_ml: "ഒരു യാത്രയുടെ അല്ലെങ്കിൽ പ്രോജക്റ്റിന്റെ സാമ്പത്തിക കാര്യങ്ങൾ ശ്രദ്ധിക്കാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 💼",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am very disciplined and stick to a schedule. 🗓️",
    q_ml: "ഞാൻ വളരെ അച്ചടക്കമുള്ള ആളാണ്, ഒരു സമയക്രമം പാലിക്കാൻ ശ്രദ്ധിക്കും. 🗓️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I like to guide and teach my friends how to do things. 🧑‍🏫",
    q_ml: "എന്റെ കൂട്ടുകാരെ കാര്യങ്ങൾ ചെയ്യാൻ പഠിപ്പിക്കാനും നയിക്കാനും ഞാൻ ഇഷ്ടപ്പെടുന്നു. 🧑‍🏫",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy subjects that involve complex formulas and theories. ➗",
    q_ml: "സങ്കീർണ്ണമായ സൂത്രവാക്യങ്ങളും സിദ്ധാന്തങ്ങളും ഉൾപ്പെടുന്ന വിഷയങ്ങൾ ഞാൻ ഇഷ്ടപ്പെടുന്നു. ➗",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "When I have a problem, I first look for the most logical and rational solution. 💡",
    q_ml: "ഒരു പ്രശ്നം വരുമ്പോൾ, ഏറ്റവും യുക്തിസഹവും കൃത്യവുമായ പരിഹാരം കണ്ടെത്താനാണ് ഞാൻ ആദ്യം ശ്രമിക്കുക. 💡",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I would like to have a job where I make big decisions that affect many people. 🏛️",
    q_ml: "ഒരുപാട് ആളുകളെ സ്വാധീനിക്കുന്ന പ്രധാനപ്പെട്ട തീരുമാനങ്ങൾ എടുക്കുന്ന ജോലി ചെയ്യാൻ ഞാൻ ആഗ്രഹിക്കുന്നു. 🏛️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am interested in the stock market and how companies are valued. 📈",
    q_ml: "ഓഹരി വിപണിയെക്കുറിച്ചും കമ്പനികളുടെ മൂല്യത്തെക്കുറിച്ചും അറിയാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 📈",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am more of a doer than a thinker. 💪",
    q_ml: "ഞാൻ കൂടുതൽ കാര്യങ്ങൾ ചെയ്തുതീർക്കാൻ ഇഷ്ടപ്പെടുന്ന ഒരാളാണ്. 💪",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at explaining difficult concepts to others. 🧑‍🏫",
    q_ml: "പ്രയാസമുള്ള കാര്യങ്ങൾ എളുപ്പത്തിൽ മറ്റുള്ളവർക്ക് മനസ്സിലാക്കിക്കൊടുക്കാൻ എനിക്ക് കഴിവുണ്ട്. 🧑‍🏫",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "Which profession do you respect more? 🙏",
    q_ml: "ഈ രണ്ട് തൊഴിലുകളിൽ ഏതിനോടാണ് നിങ്ങൾക്ക് കൂടുതൽ ബഹുമാനം? 🙏",
    options: [
      {
        text_en: "A CEO of a large company.",
        text_ml: "വലിയൊരു കമ്പനിയുടെ CEO.",
        score: { C: 1 },
      },
      {
        text_en: "A politician or a judge.",
        text_ml: "ഒരു രാഷ്ട്രീയക്കാരൻ അല്ലെങ്കിൽ ഒരു ജഡ്ജി.",
        score: { U: 1 },
      },
    ],
  },
  {
    q_en: "I am curious about how the human body works. 🧬",
    q_ml: "മനുഷ്യശരീരം എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്നതിനെക്കുറിച്ച് എനിക്ക് ജിജ്ഞാസയുണ്ട്. 🧬",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I prefer to follow a set of rules and procedures rather than create my own. 📜",
    q_ml: "സ്വന്തമായി നിയമങ്ങൾ ഉണ്ടാക്കുന്നതിനേക്കാൾ, നിലവിലുള്ള നിയമങ്ങളും നടപടിക്രമങ്ങളും പാലിക്കുന്നതാണ് എനിക്കിഷ്ടം. 📜",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy leadership roles in school or group activities. 👑",
    q_ml: "സ്കൂളിലെ ഗ്രൂപ്പ് പ്രവർത്തനങ്ങളിൽ നേതൃത്വം വഹിക്കാൻ എനിക്ക് ഇഷ്ടമാണ്. 👑",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am fascinated by new technologies and gadgets. 🤖",
    q_ml: "പുതിയ സാങ്കേതിക വിദ്യകളും ഉപകരണങ്ങളും എന്നെ ആകർഷിക്കുന്നു. 🤖",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I have a natural ability to connect with different types of people. 🤝",
    q_ml: "പല തരത്തിലുള്ള ആളുകളുമായി വേഗത്തിൽ സൗഹൃദത്തിലാകാൻ എനിക്ക് കഴിവുണ്ട്. 🤝",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "Which sounds more rewarding to you? ✨",
    q_ml: "ഈ രണ്ട് കാര്യങ്ങളിൽ ഏതാണ് നിങ്ങൾക്ക് കൂടുതൽ സന്തോഷം നൽകുക? ✨",
    options: [
      {
        text_en: "Inventing a machine that saves energy.",
        text_ml: "ഊർജ്ജം ലാഭിക്കുന്ന ഒരു യന്ത്രം കണ്ടുപിടിക്കുക.",
        score: { J: 1 },
      },
      {
        text_en:
          "Helping a family overcome a difficult financial situation.",
        text_ml:
          "ഒരു കുടുംബത്തെ സാമ്പത്തിക പ്രതിസന്ധിയിൽ നിന്ന് സഹായിക്കുക.",
        score: { C: 1 },
      },
    ],
  },
  {
    q_en: "I can remain objective and make decisions without letting my emotions interfere. 🤖",
    q_ml: "വികാരങ്ങൾ നിയന്ത്രിക്കാനും യുക്തിസഹമായി തീരുമാനങ്ങൾ എടുക്കാനും എനിക്ക് സാധിക്കും. 🤖",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I would rather work with data than with people. 📊",
    q_ml: "ആളുകളുമായി ഇടപഴകുന്നതിനേക്കാൾ കണക്കുകളുമായി പ്രവർത്തിക്കുന്നതാണ് എനിക്കിഷ്ടം. 📊",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am interested in the history of nations and their governments. 📜",
    q_ml: "രാജ്യങ്ങളുടെ ചരിത്രത്തെക്കുറിച്ചും ഭരണത്തെക്കുറിച്ചും അറിയാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 📜",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am very responsible and make sure I finish my work on time. ⏰",
    q_ml: "ഞാൻ വളരെ ഉത്തരവാദിത്വമുള്ള ആളാണ്, സമയത്തിന് എന്റെ ജോലികൾ പൂർത്തിയാക്കാൻ ശ്രദ്ധിക്കും. ⏰",
    options: [
      {
        text_en: "Yes",
        text_ml: "അതെ",
        score: { N: 1, J: 1, C: 1, U: 1 },
      },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy activities that require physical strength or coordination. 🏃",
    q_ml: "ശരീരത്തിന് ശക്തിയും ഏകോപനവും ആവശ്യമുള്ള ജോലികൾ ഞാൻ ഇഷ്ടപ്പെടുന്നു. 🏃",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at managing my time and multi-tasking. ⏳",
    q_ml: "എനിക്ക് എന്റെ സമയം കൃത്യമായി ക്രമീകരിക്കാനും പല ജോലികൾ ഒരുമിച്ച് ചെയ്യാനും കഴിവുണ്ട്. ⏳",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, C: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I find satisfaction in helping others improve their lives. 🤗",
    q_ml: "മറ്റുള്ളവരുടെ ജീവിതം മെച്ചപ്പെടുത്താൻ സഹായിക്കുന്നത് എനിക്ക് സന്തോഷം നൽകുന്നു. 🤗",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy thinking about abstract concepts and theories. 🧐",
    q_ml: "അമൂർത്തമായ ആശയങ്ങളെക്കുറിച്ചും സിദ്ധാന്തങ്ങളെക്കുറിച്ചും ചിന്തിക്കാൻ എനിക്ക് ഇഷ്ടമാണ്. 🧐",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I like to be in a position of authority and guide others. 👑",
    q_ml: "അധികാരം ഉപയോഗിച്ച് മറ്റുള്ളവരെ നയിക്കുന്ന ഒരു സ്ഥാനത്തിരിക്കാൻ എനിക്ക് ഇഷ്ടമാണ്. 👑",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am interested in medicine and health-related topics. 🩺",
    q_ml: "വൈദ്യശാസ്ത്രത്തിലും ആരോഗ്യ സംബന്ധമായ വിഷയങ്ങളിലും എനിക്ക് താൽപ്പര്യമുണ്ട്. 🩺",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I prefer a job with a clear set of tasks and responsibilities. 📋",
    q_ml: "വ്യക്തമായ ജോലികളും ഉത്തരവാദിത്തങ്ങളുമുള്ള ഒരു ജോലി ഞാൻ ഇഷ്ടപ്പെടുന്നു. 📋",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I can stay calm and think logically even in a chaotic situation. 🤖",
    q_ml: "ആശയക്കുഴപ്പമുള്ള സാഹചര്യങ്ങളിൽ പോലും ശാന്തമായി ചിന്തിക്കാൻ എനിക്ക് സാധിക്കും. 🤖",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy speaking in public or in front of a large group. 🗣️",
    q_ml: "പൊതുസ്ഥലത്ത് അല്ലെങ്കിൽ ഒരു വലിയ കൂട്ടത്തിന് മുന്നിൽ സംസാരിക്കുന്നത് എനിക്ക് ഇഷ്ടമാണ്. 🗣️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at understanding and working with numbers. 🔢",
    q_ml: "കണക്കുകളും സംഖ്യകളും മനസ്സിലാക്കാനും പ്രവർത്തിക്കാനും എനിക്ക് കഴിവുണ്ട്. 🔢",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am more interested in the causes of a problem than the symptoms. 🕵️",
    q_ml: "ഒരു പ്രശ്നത്തിന്റെ ലക്ഷണങ്ങളേക്കാൾ, അതിന്റെ മൂലകാരണത്തെക്കുറിച്ച് അറിയാനാണ് എനിക്ക് കൂടുതൽ താൽപ്പര്യം. 🕵️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy working on projects that have a direct impact on the community. 🤝",
    q_ml: "സമൂഹത്തിന് നേരിട്ട് പ്രയോജനപ്പെടുന്ന പ്രോജക്റ്റുകളിൽ പ്രവർത്തിക്കാൻ ഞാൻ ഇഷ്ടപ്പെടുന്നു. 🤝",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1, N: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am a patient person who can handle repetitive tasks. 🕰️",
    q_ml: "ഒരേ ജോലികൾ ആവർത്തിച്ച് ചെയ്യാൻ ക്ഷമയുള്ള ഒരാളാണ് ഞാൻ. 🕰️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at making complex information easy to understand for others. 🧑‍🏫",
    q_ml: "സങ്കീർണ്ണമായ വിവരങ്ങൾ മറ്റുള്ളവർക്ക് എളുപ്പത്തിൽ മനസ്സിലാക്കി കൊടുക്കാൻ എനിക്ക് കഴിവുണ്ട്. 🧑‍🏫",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, J: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am interested in global economics and politics. 🌐",
    q_ml: "ആഗോള സാമ്പത്തിക കാര്യങ്ങളെക്കുറിച്ചും രാഷ്ട്രീയത്തെക്കുറിച്ചും അറിയാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 🌐",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I enjoy planning and executing a project from start to finish. 🛠️",
    q_ml: "ഒരു പ്രോജക്റ്റ് തുടക്കം മുതൽ ഒടുക്കം വരെ ആസൂത്രണം ചെയ്ത് നടപ്പിലാക്കാൻ എനിക്ക് ഇഷ്ടമാണ്. 🛠️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am confident in my ability to make decisions without consulting others. 👑",
    q_ml: "മറ്റുള്ളവരുമായി ആലോചിക്കാതെ തന്നെ തീരുമാനങ്ങൾ എടുക്കാൻ എനിക്ക് ആത്മവിശ്വാസമുണ്ട്. 👑",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "Which of these sounds more fulfilling? ❤️",
    q_ml: "ഈ രണ്ട് കാര്യങ്ങളിൽ ഏതാണ് നിങ്ങൾക്ക് കൂടുതൽ സന്തോഷം നൽകുക? ❤️",
    options: [
      {
        text_en: "Helping a sick person feel better.",
        text_ml: "അസുഖമുള്ള ഒരാളെ സഹായിക്കുക.",
        score: { N: 1 },
      },
      {
        text_en: "Creating a new software program.",
        text_ml: "ഒരു പുതിയ സോഫ്റ്റ്‌വെയർ പ്രോഗ്രാം ഉണ്ടാക്കുക.",
        score: { J: 1 },
      },
    ],
  },
  {
    q_en: "I am organized and keep my belongings and notes neat. 📋",
    q_ml: "ഞാൻ എൻ്റെ സാധനങ്ങളും നോട്ടുകളും വൃത്തിയായി സൂക്ഷിക്കുന്ന ആളാണ്. 📋",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am good at mediating conflicts between friends. 🤝",
    q_ml: "കൂട്ടുകാർക്കിടയിൽ ഉണ്ടാകുന്ന തർക്കങ്ങൾ പരിഹരിക്കാൻ എനിക്ക് കഴിവുണ്ട്. 🤝",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { N: 1, U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I find it easy to focus on one task for a long period of time. 🕰️",
    q_ml: "ഒരു ജോലിയിൽ ദീർഘനേരം ശ്രദ്ധ കേന്ദ്രീകരിക്കാൻ എനിക്ക് എളുപ്പമാണ്. 🕰️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I am interested in how laws are made and how the government works. 🏛️",
    q_ml: "നിയമങ്ങൾ എങ്ങനെ ഉണ്ടാക്കുന്നു എന്നും സർക്കാർ എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്നും അറിയാൻ എനിക്ക് താൽപ്പര്യമുണ്ട്. 🏛️",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { U: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
  {
    q_en: "I prefer a career where I can take risks and be innovative. 💡",
    q_ml: "റിസ്കുകൾ എടുക്കാനും പുതിയ കാര്യങ്ങൾ പരീക്ഷിക്കാനും കഴിയുന്ന ഒരു തൊഴിൽ ഞാൻ ഇഷ്ടപ്പെടുന്നു. 💡",
    options: [
      { text_en: "Yes", text_ml: "അതെ", score: { J: 1, C: 1 } },
      { text_en: "No", text_ml: "അല്ല", score: {} },
    ],
  },
];

let currentQuestionIndex = 0;
let scores = { N: 0, J: 0, U: 0, C: 0 };
let answers = [];
let isMalayalam = false;
let chartInstance = null;
let timerInterval = null;
let timeLeftInSeconds = 8 * 60; // 8 minutes
let studentData = {};

// UI Elements
const homepageSection = document.getElementById("homepage-section");
const dataCollectionSection = document.getElementById(
  "data-collection-section"
);
const testSection = document.getElementById("test-section");
const reportSection = document.getElementById("report-section");
const startTestButton = document.getElementById("start-test-button");
const dataCollectionForm = document.getElementById("user-data-form");
const languageToggle = document.getElementById("language-toggle");
const questionTextElement = document.getElementById("question-text");
const optionAButton = document.getElementById("option-a");
const optionBButton = document.getElementById("option-b");
const goBackButton = document.getElementById("go-back-button");
const questionCountElement = document.getElementById("question-count");
const progressBarElement = document.getElementById("progress-bar");
const encouragingMessageContainer = document.getElementById(
  "encouraging-message-container"
);
const timerElement = document.getElementById("timer");
const shareReportButton = document.getElementById("share-report-button");
const shareMessage = document.getElementById("share-message");
const downloadPdfButton = document.getElementById("download-pdf-button");

// Dynamic elements for the PDF generation
const pdfContent = document.createElement("div");
pdfContent.id = "pdf-content";
pdfContent.style.width = "100%";
pdfContent.style.padding = "20px";
pdfContent.style.boxSizing = "border-box";
pdfContent.style.fontFamily = "Inter, sans-serif";
pdfContent.style.display = "none";
document.body.appendChild(pdfContent);

const careerPaths = {
  N: {
    en: "Doctor (NEET) 🩺",
    ml: "ഡോക്ടർ (NEET) 🩺",
    description_en:
      "Your aptitude for science, empathy, and problem-solving makes a career in medicine a strong fit. Doctors require strong communication and a calm, logical approach under pressure.",
    description_ml:
      "ശാസ്ത്രം, സഹാനുഭൂതി, പ്രശ്നപരിഹാര ശേഷി എന്നിവയിൽ നിങ്ങൾക്കുള്ള കഴിവ് ഡോക്ടർ എന്ന കരിയറിന് അനുയോജ്യമാണ്. ഡോക്ടർമാർക്ക് സമ്മർദ്ദമുള്ള സാഹചര്യങ്ങളിൽപ്പോലും ശാന്തവും യുക്തിസഹവുമായ സമീപനവും മികച്ച ആശയവിനിമയ ശേഷിയും ആവശ്യമാണ്.",
    strengths_en: [
      "Empathy & Compassion",
      "Analytical Thinking",
      "Discipline & Responsibility",
      "Communication Skills",
    ],
    strengths_ml: [
      "സഹാനുഭൂതിയും അനുകമ്പയും",
      "വിശകലന ശേഷി",
      "അച്ചടക്കവും ഉത്തരവാദിത്തബോധവും",
      "മികച്ച ആശയവിനിമയ ശേഷി",
    ],
    advice_en: [
      "Focus on understanding complex biological and chemical processes.",
      "Develop strong interpersonal skills to connect with others.",
      "Cultivate a disciplined study routine.",
    ],
    advice_ml: [
      "സങ്കീർണ്ണമായ ജീവശാസ്ത്ര, രാസപ്രവർത്തനങ്ങൾ മനസ്സിലാക്കാൻ ശ്രദ്ധിക്കുക.",
      "മറ്റുള്ളവരുമായി ബന്ധം സ്ഥാപിക്കാൻ വ്യക്തിഗത കഴിവുകൾ വികസിപ്പിക്കുക.",
      "അച്ചടക്കമുള്ള പഠനരീതി ശീലമാക്കുക.",
    ],
    lacks_en: [
      "Analytical Thinking",
      "Leadership",
      "Financial Management",
    ],
    lacks_ml: ["വിശകലന ശേഷി", "നേതൃത്വപാടവം", "സാമ്പത്തിക കാര്യങ്ങൾ"],
  },
  J: {
    en: "Engineer (JEE) ⚙️",
    ml: "എഞ്ചിനീയർ (JEE) ⚙️",
    description_en:
      "Your logical, problem-solving, and practical skills align perfectly with a career in engineering. Engineers are innovative thinkers who enjoy building and creating solutions.",
    description_ml:
      "നിങ്ങളുടെ യുക്തിപരമായ പ്രശ്‌നപരിഹാര ശേഷിയും പ്രായോഗിക ബുദ്ധിയും എഞ്ചിനീയറിംഗ് കരിയറിന് തികച്ചും അനുയോജ്യമാണ്. എഞ്ചിനീയർമാർ പുതിയ പരിഹാരങ്ങൾ ഉണ്ടാക്കുന്നതിലും നിർമ്മിക്കുന്നതിലും താല്പര്യമുള്ളവരാണ്.",
    strengths_en: [
      "Logical & Analytical Skills",
      "Innovation & Creativity",
      "Problem-Solving",
      "Attention to Detail",
    ],
    strengths_ml: [
      "യുക്തിപരമായതും വിശകലനപരവുമായ കഴിവുകൾ",
      "നൂതന ചിന്തയും സർഗ്ഗാത്മകതയും",
      "പ്രശ്നപരിഹാര ശേഷി",
      "കാര്യങ്ങൾ ശ്രദ്ധയോടെ ചെയ്യുന്നതിനുള്ള കഴിവ്",
    ],
    advice_en: [
      "Strengthen your foundation in physics and mathematics.",
      "Work on projects that require you to build or design things.",
      "Think critically about how things work and how they can be improved.",
    ],
    advice_ml: [
      "ഫിസിക്സിലും ഗണിതത്തിലും നിങ്ങളുടെ അടിത്തറ ശക്തമാക്കുക.",
      "നിർമ്മാണവും രൂപകൽപ്പനയും ആവശ്യമുള്ള പ്രോജക്റ്റുകളിൽ പ്രവർത്തിക്കുക.",
      "സാഹചര്യങ്ങൾ എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്നും എങ്ങനെ മെച്ചപ്പെടുത്താമെന്നും വിമർശനാത്മകമായി ചിന്തിക്കുക.",
    ],
    lacks_en: ["Empathy", "Public Speaking", "People Management"],
    lacks_ml: [
      "സഹാനുഭൂതി",
      "പൊതുവേദിയിൽ സംസാരിക്കാനുള്ള കഴിവ്",
      "ആളുകളെ നയിക്കാനുള്ള കഴിവ്",
    ],
  },
  U: {
    en: "Civil Servant (UPSC) 🏛️",
    ml: "സിവിൽ സർവീസ് (UPSC) 🏛️",
    description_en:
      "Your aptitude for leadership, public service, and understanding society indicates a strong potential for a career in the civil service. This path requires a broad knowledge of the world and a drive to serve the public.",
    description_ml:
      "നേതൃത്വപാടവം, പൊതുസേവനം, സമൂഹത്തെക്കുറിച്ചുള്ള നിങ്ങളുടെ അറിവ് എന്നിവ സിവിൽ സർവീസിന് അനുയോജ്യമാണ്. ഈ മേഖലയിൽ ലോകത്തെക്കുറിച്ചുള്ള വിപുലമായ അറിവും പൊതുജനങ്ങളെ സേവിക്കാനുള്ള താല്പര്യവും ആവശ്യമാണ്.",
    strengths_en: [
      "Leadership & Authority",
      "Social & Political Awareness",
      "Communication & Debating Skills",
      "Discipline & Responsibility",
    ],
    strengths_ml: [
      "നേതൃത്വവും അധികാരവും",
      "സാമൂഹികവും രാഷ്ട്രീയവുമായ അവബോധം",
      "ആശയവിനിമയവും സംവാദവും",
      "അച്ചടക്കവും ഉത്തരവാദിത്തബോധവും",
    ],
    advice_en: [
      "Stay updated on current affairs and global politics.",
      "Practice public speaking and articulating your ideas clearly.",
      "Develop a disciplined study and work routine.",
    ],
    advice_ml: [
      "സമകാലിക കാര്യങ്ങളെക്കുറിച്ചും ആഗോള രാഷ്ട്രീയത്തെക്കുറിച്ചും അപ്‌ഡേറ്റ് ആയിരിക്കുക.",
      "പൊതുവേദിയിൽ സംസാരിക്കാനും നിങ്ങളുടെ ആശയങ്ങൾ വ്യക്തമാക്കാനും പരിശീലിക്കുക.",
      "അച്ചടക്കമുള്ള പഠനരീതി ശീലമാക്കുക.",
    ],
    lacks_en: ["Analytical skills", "Numerical skills", "Data Handling"],
    lacks_ml: [
      "വിശകലന ശേഷി",
      "ഗണിതപരമായ കഴിവുകൾ",
      "കണക്കുകൾ കൈകാര്യം ചെയ്യാനുള്ള കഴിവ്",
    ],
  },
  C: {
    en: "Commerce Professional (CA/CMA) 📈",
    ml: "കൊമേഴ്സ് പ്രൊഫഷണൽ (CA/CMA) 📈",
    description_en:
      "Your affinity for numbers, organization, and logical thinking makes you a strong candidate for a career in commerce. This profession requires a methodical approach and a keen eye for financial details.",
    description_ml:
      "സംഖ്യകളോടും, കാര്യങ്ങൾ ചിട്ടപ്പെടുത്തുന്നതിനോടും, യുക്തിപരമായ ചിന്തയോടുമുള്ള നിങ്ങളുടെ താൽപ്പര്യം കൊമേഴ്സ് പ്രൊഫഷണൽ എന്ന കരിയറിന് അനുയോജ്യമാക്കുന്നു. ഈ മേഖലയിൽ കൃത്യമായ സമീപനവും സാമ്പത്തിക കാര്യങ്ങളെക്കുറിച്ച് സൂക്ഷ്മമായ അറിവും ആവശ്യമാണ്.",
    strengths_en: [
      "Numerical & Analytical Skills",
      "Organized & Methodical",
      "Attention to Financial Detail",
      "Logical Thinking",
    ],
    strengths_ml: [
      "ഗണിതപരമായതും വിശകലനപരവുമായ കഴിവുകൾ",
      "ചിട്ടയായതും വ്യവസ്ഥാപിതവുമായ സമീപനം",
      "സാമ്പത്തിക കാര്യങ്ങളിലുള്ള ശ്രദ്ധ",
      "യുക്തിപരമായ ചിന്ത",
    ],
    advice_en: [
      "Strengthen your foundation in mathematics and statistics.",
      "Practice managing personal finances or a small project budget.",
      "Develop your ability to focus on detail-oriented tasks for long periods.",
    ],
    advice_ml: [
      "ഗണിതത്തിലും സ്റ്റാറ്റിസ്റ്റിക്സിലും നിങ്ങളുടെ അടിത്തറ ശക്തമാക്കുക.",
      "നിങ്ങളുടെ സ്വന്തം സാമ്പത്തിക കാര്യങ്ങൾ അല്ലെങ്കിൽ ഒരു ചെറിയ പ്രോജക്റ്റിന്റെ ബജറ്റ് കൈകാര്യം ചെയ്യാൻ പരിശീലിക്കുക.",
      "വിശദാംശങ്ങളിൽ ശ്രദ്ധ കേന്ദ്രീകരിച്ച് ദീർഘനേരം ജോലി ചെയ്യാനുള്ള കഴിവ് വികസിപ്പിക്കുക.",
    ],
    lacks_en: [
      "Empathy",
      "Public Service Mindset",
      "Physical coordination",
    ],
    lacks_ml: ["സഹാനുഭൂതി", "പൊതുസേവന മനോഭാവം", "ശാരീരിക ഏകോപനം"],
  },
};

const encouragingMessages_en = [
  "You're doing great! Keep going.",
  "That's the right direction! You're on track.",
  "You're halfway there! Almost done.",
  "Keep up the good work!",
  "Just a few more questions to go!",
  "You're in the final stretch now!",
  "Awesome, you're almost done!",
];
const encouragingMessages_ml = [
  "നന്നായി പോകുന്നു! തുടരുക.",
  "ശരി ദിശയിലാണ്! നിങ്ങൾ ലക്ഷ്യത്തിലാണ്.",
  "ഏകദേശം പകുതിയായി! പൂർത്തിയാക്കാൻ ഇനി കുറച്ചുകൂടി മതി.",
  "നിങ്ങളുടെ കഠിനാധ്വാനം തുടരുക!",
  "ഇനി കുറച്ച് ചോദ്യങ്ങൾ മാത്രം!",
  "നിങ്ങൾ അവസാന ഘട്ടത്തിലാണ്!",
  "അതിമനോഹരം, നിങ്ങൾ പൂർത്തിയാക്കാറായി!",
];

// Functions
const renderQuestion = () => {
  if (currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex];
    const qText = isMalayalam ? question.q_ml : question.q_en;
    const optA_text = isMalayalam
      ? question.options[0].text_ml
      : question.options[0].text_en;
    const optB_text = isMalayalam
      ? question.options[1].text_ml
      : question.options[1].text_en;

    questionTextElement.textContent = qText;
    optionAButton.textContent = optA_text;
    optionBButton.textContent = optB_text;

    // Update progress bar
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressBarElement.style.width = `${progress}%`;
    questionCountElement.textContent = isMalayalam
      ? `ചോദ്യം ${currentQuestionIndex + 1} of ${questions.length}`
      : `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Show encouraging message every 10 questions
    encouragingMessageContainer.textContent = "";
    if (
      (currentQuestionIndex + 1) % 10 === 0 &&
      currentQuestionIndex !== questions.length - 1
    ) {
      const message = isMalayalam
        ? encouragingMessages_ml[currentQuestionIndex / 10 - 1]
        : encouragingMessages_en[currentQuestionIndex / 10 - 1];
      encouragingMessageContainer.textContent = message;
    }

    goBackButton.classList.toggle("hidden", currentQuestionIndex === 0);
  } else {
    generateReport();
  }
};

const handleAnswer = (optionIndex) => {
  const selectedOption =
    questions[currentQuestionIndex].options[optionIndex];
  answers[currentQuestionIndex] = {
    question_en: questions[currentQuestionIndex].q_en,
    question_ml: questions[currentQuestionIndex].q_ml,
    selected_option: selectedOption.text_en,
    score_awarded: selectedOption.score,
  };

  // Apply visual feedback
  const clickedButton = optionIndex === 0 ? optionAButton : optionBButton;
  const otherButton = optionIndex === 0 ? optionBButton : optionAButton;
  clickedButton.classList.add("clicked");
  otherButton.classList.remove("clicked");

  setTimeout(() => {
    // Update scores
    for (const key in selectedOption.score) {
      scores[key] += selectedOption.score[key];
    }
    currentQuestionIndex++;
    renderQuestion();
    clickedButton.classList.remove("clicked");
  }, 300); // Small delay for the animation
};

const goBack = () => {
  if (currentQuestionIndex > 0) {
    // Remove the score of the last answer
    const lastAnswer = answers[currentQuestionIndex - 1];
    for (const key in lastAnswer.score_awarded) {
      scores[key] -= lastAnswer.score_awarded[key];
    }
    currentQuestionIndex--;
    renderQuestion();
  }
};

const toggleLanguage = () => {
  isMalayalam = !isMalayalam;
  languageToggle.textContent = isMalayalam
    ? "Switch to English"
    : "മലയാളത്തിലേക്ക് മാറ്റുക";
  // Update splash screen text
  if (!homepageSection.classList.contains("hidden")) {
    // No splash screen text for homepage now, just the main app title
  }

  // Re-render test elements if on the test section
  if (!testSection.classList.contains("hidden")) {
    renderQuestion();
    goBackButton.textContent = isMalayalam ? "തിരികെ പോകുക" : "Go Back";
    // Re-render timer for language change
    updateTimer(true);
  }

  // Re-render report elements if on the report section
  if (!reportSection.classList.contains("hidden")) {
    generateReport(); // Re-generates report with correct language
    shareReportButton.textContent = isMalayalam
      ? "റിപ്പോർട്ട് പങ്കിടുക"
      : "Share Report";
    shareMessage.textContent = isMalayalam
      ? "റിപ്പോർട്ട് നിങ്ങളുടെ ക്ലിപ്ബോർഡിലേക്ക് കോപ്പി ചെയ്തു!"
      : "Report copied to your clipboard!";
    document.getElementById("report-section").children[0].textContent =
      isMalayalam
        ? "നിങ്ങളുടെ അഭിരുചി റിപ്പോർട്ട്"
        : "Your Aptitude Report";
    document.getElementById(
      "report-section"
    ).children[1].children[0].textContent = isMalayalam
        ? "നിങ്ങളുടെ പ്രധാന കരിയർ പാത:"
        : "Your Primary Career Path:";
    document.getElementById(
      "report-section"
    ).children[2].children[0].textContent = isMalayalam
        ? "വിശദമായ സ്വഭാവ വിശകലനം"
        : "Detailed Trait Analysis";
    document.getElementById(
      "report-section"
    ).children[2].children[1].children[0].children[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>പ്രധാന കഴിവുകൾ`;
    document.getElementById(
      "report-section"
    ).children[2].children[1].children[1].children[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>ശ്രദ്ധ നൽകേണ്ട മേഖലകൾ`;
    document.getElementById(
      "report-section"
    ).children[3].children[0].textContent = isMalayalam
        ? "മറ്റ് കരിയർ പാതകൾ"
        : "Other Career Paths";
  }
};

const generateReport = async () => {
  clearInterval(timerInterval); // Stop the timer

  const careerLabels = {
    N: isMalayalam ? "ഡോക്ടർ (NEET) 🩺" : "Doctor (NEET) 🩺",
    J: isMalayalam ? "എഞ്ചിനീയർ (JEE) ⚙️" : "Engineer (JEE) ⚙️",
    U: isMalayalam ? "സിവിൽ സർവീസ് (UPSC) 🏛️" : "Civil Servant (UPSC) 🏛️",
    C: isMalayalam
      ? "കൊമേഴ്സ് പ്രൊഫഷണൽ (CA/CMA) 📈"
      : "Commerce Professional (CA/CMA) 📈",
  };
  const scoresArray = Object.values(scores);
  const maxScore = Math.max(...scoresArray);
  const topCareers = Object.keys(scores).filter(
    (key) => scores[key] === maxScore
  );

  let primaryResultText = "";
  let resultDescriptionText = "";

  if (topCareers.length === 1) {
    const careerKey = topCareers[0];
    primaryResultText = careerLabels[careerKey];
    resultDescriptionText = isMalayalam
      ? careerPaths[careerKey].description_ml
      : careerPaths[careerKey].description_en;
  } else {
    const careerNames = topCareers
      .map((key) => careerLabels[key])
      .join(isMalayalam ? " അല്ലെങ്കിൽ " : " and ");
    primaryResultText = isMalayalam
      ? `വിവിധ മേഖലകളിൽ കഴിവുള്ള വിദ്യാർത്ഥി, ${careerNames}`
      : `Versatile Candidate for ${careerNames.replace(
        " അല്ലെങ്കിൽ ",
        " and "
      )}`;
    resultDescriptionText = isMalayalam
      ? `നിങ്ങൾക്ക് ഈ മേഖലകളിലെല്ലാം മികച്ച സാധ്യതകളുണ്ട്.`
      : `You have strong potential in all these fields.`;
  }

  document.getElementById("primary-result").textContent =
    primaryResultText;
  document.getElementById("result-description").textContent =
    resultDescriptionText;

  // Generate bar chart
  const chartData = {
    labels: Object.values(careerLabels),
    datasets: [
      {
        label: isMalayalam ? "അഭിരുചി സ്കോർ" : "Aptitude Score",
        data: scoresArray,
        backgroundColor: ["#ef4444", "#f97316", "#10b981", "#6366f1"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { stepSize: 1 },
      },
      x: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const ctx = document.getElementById("score-chart").getContext("2d");
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: chartOptions,
  });

  // Generate detailed trait analysis
  const strengthsList = document.getElementById("key-strengths");
  const workOnList = document.getElementById("areas-to-work-on");
  strengthsList.innerHTML = "";
  workOnList.innerHTML = "";

  const primaryCareerKey = topCareers[0];
  const strengths = isMalayalam
    ? careerPaths[primaryCareerKey].strengths_ml
    : careerPaths[primaryCareerKey].strengths_en;
  const weaknesses = isMalayalam
    ? careerPaths[primaryCareerKey].lacks_ml
    : careerPaths[primaryCareerKey].lacks_en;

  strengths.forEach((strength) => {
    const li = document.createElement("li");
    li.textContent = strength;
    strengthsList.appendChild(li);
  });

  weaknesses.forEach((weakness) => {
    const li = document.createElement("li");
    li.textContent = weakness;
    workOnList.appendChild(li);
  });

  // Generate "Other Career Paths"
  const otherPathsContainer = document.getElementById(
    "other-paths-content"
  );
  otherPathsContainer.innerHTML = "";

  const otherCareers = Object.keys(scores).filter(
    (key) => !topCareers.includes(key)
  );
  otherCareers.forEach((key) => {
    const careerInfo = isMalayalam
      ? careerPaths[key].description_ml
      : careerPaths[key].description_en;
    const pathDiv = document.createElement("div");
    pathDiv.classList.add(
      "bg-gray-50",
      "rounded-xl",
      "p-4",
      "border-l-4",
      "border-gray-300",
      "shadow-sm"
    );
    pathDiv.innerHTML = `<h5 class="text-md font-semibold text-gray-800 prominent-heading">${careerLabels[key]}</h5><p class="text-sm text-gray-600 mt-1">${careerInfo}</p>`;
    otherPathsContainer.appendChild(pathDiv);
  });

  // Save data to Firestore after report is generated
  try {
    if (userId) {
      await addDoc(
        collection(db, `artifacts/${appId}/public/data/aptitude_tests`),
        {
          student_data: studentData,
          scores: scores,
          answers: answers,
          result: primaryResultText,
          timestamp: serverTimestamp(),
        }
      );
      console.log("Data saved to Firestore.");
    } else {
      console.log("User not authenticated, data not saved.");
    }
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
  }

  // Show report and hide others
  homepageSection.classList.add("hidden");
  dataCollectionSection.classList.add("hidden");
  testSection.classList.add("hidden");
  reportSection.classList.remove("hidden");
};

const updateTimer = (forceUpdate = false) => {
  const minutes = Math.floor(timeLeftInSeconds / 60);
  const seconds = timeLeftInSeconds % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  timerElement.textContent = `⏳ ${displayTime}`;

  if (timeLeftInSeconds <= 0) {
    generateReport();
  } else if (!forceUpdate) {
    timeLeftInSeconds--;
  }
};

const generateShareableImage = () => {
  const reportContent =
    document.getElementById("report-section").innerHTML;
  const content = `
                <div style="padding: 20px; background-color: #f0f4f8; text-align: center; border-radius: 16px; font-family: 'Inter', sans-serif;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #1f2937;">Qmentr Aptitude Test Report</h1>
                    <div style="margin-top: 20px; background-color: #6366f1; padding: 20px; border-radius: 12px; color: white;">
                        <h3 style="font-size: 18px; font-weight: 600;">Your Primary Career Path:</h3>
                        <p style="font-size: 24px; font-weight: 800;">${document.getElementById("primary-result").textContent
    }</p>
                    </div>
                    <div style="margin-top: 20px; background-color: white; padding: 20px; border-radius: 12px; border: 2px solid #e5e7eb;">
                        <h4 style="font-size: 18px; font-weight: 700; color: #1f2937;">Detailed Trait Analysis</h4>
                        <ul style="list-style: none; padding: 0; text-align: left; margin-top: 10px;">
                            ${Array.from(
      document.getElementById("key-strengths").children
    )
      .map(
        (li) =>
          `<li style="display: flex; align-items: center; margin-bottom: 5px;"><span style="color: #22c55e;">✔</span>&nbsp;${li.textContent}</li>`
      )
      .join("")}
                        </ul>
                    </div>
                </div>
            `;
  const blob = new Blob([content], { type: "text/html" });
  const item = new ClipboardItem({ "text/html": blob });
  navigator.clipboard
    .write([item])
    .then(() => {
      shareMessage.classList.remove("hidden");
      setTimeout(() => {
        shareMessage.classList.add("hidden");
      }, 3000);
    })
    .catch((err) => {
      console.error("Failed to copy to clipboard", err);
    });
};

const downloadPDF = () => {
  const element = document.getElementById("pdf-content");

  // Create a temporary clone of the report section
  const reportClone = document
    .getElementById("report-section")
    .cloneNode(true);
  reportClone.style.display = "block";

  // Add student data to the clone
  const studentInfo = document.createElement("div");
  studentInfo.classList.add("my-4", "p-4", "bg-gray-100", "rounded-lg");
  studentInfo.innerHTML = `
                <h3 class="text-lg font-bold mb-2 prominent-heading">Student Details</h3>
                <p><strong>Name:</strong> ${studentData.name}</p>
                <p><strong>Mobile:</strong> ${studentData.mobile}</p>
                <p><strong>Guardian's Mobile:</strong> ${studentData.guardianMobile || "N/A"
    }</p>
                <p><strong>User ID:</strong> ${userId || "N/A"}</p>
            `;
  reportClone.prepend(studentInfo);

  // Add the clone to the main body for html2pdf to process
  document.body.appendChild(reportClone);

  html2pdf()
    .from(reportClone)
    .save()
    .finally(() => {
      // Remove the clone after saving
      document.body.removeChild(reportClone);
    });
};

// Event Listeners
startTestButton.addEventListener("click", () => {
  homepageSection.classList.add("hidden");
  dataCollectionSection.classList.remove("hidden");
  dataCollectionSection.classList.add(
    "flex",
    "flex-col",
    "justify-between"
  );
});

dataCollectionForm.addEventListener("submit", (e) => {
  const mobile = document.getElementById("mobile-number").value.trim();
  const guardian = document.getElementById("guardian-number").value.trim();
  const countryCode = document.getElementById("country-code").value;

  // Validation
  const mobileValid = /^\d{10}$/.test(mobile);
  const guardianValid = guardian === "" || /^\d{10}$/.test(guardian);

  if (!mobileValid || !guardianValid) {
    e.preventDefault(); // stop Google Form submission
    alert("Please enter valid 10-digit numbers.");
    return;
  }

  // Set hidden fields for Google Form
  document.getElementById("MobileFull").value = countryCode + mobile;
  document.getElementById("GuardianFull").value =
    guardian ? countryCode + guardian : "";

  // Save student data (for your app)
  studentData = {
    name: document.getElementById("student-name").value,
    mobile: countryCode + mobile,
    guardianMobile: guardian ? countryCode + guardian : "",
    userId: userId,
  };

  // Switch UI & start test
  dataCollectionSection.classList.add("hidden");
  testSection.classList.remove("hidden");
  testSection.classList.add("flex", "flex-col", "justify-between");

  renderQuestion();
  timerInterval = setInterval(updateTimer, 1000);
});


optionAButton.addEventListener("click", () => handleAnswer(0));
optionBButton.addEventListener("click", () => handleAnswer(1));
goBackButton.addEventListener("click", goBack);
languageToggle.addEventListener("click", toggleLanguage);
shareReportButton.addEventListener("click", generateShareableImage);
downloadPdfButton.addEventListener("click", downloadPDF);

// Initial state
homepageSection.classList.remove("hidden");
dataCollectionSection.classList.add("hidden");
testSection.classList.add("hidden");
reportSection.classList.add("hidden");