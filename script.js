const diceEl = document.getElementById("dice");
const bigBtn = document.getElementById("big");
const smallBtn = document.getElementById("small");
const startBtn = document.getElementById("start");
const againBtn = document.getElementById("rollAgain");
const viewBtn = document.getElementById("viewDemo");
const downloadBtn = document.getElementById("downloadHistory");
const resultEl = document.getElementById("result");
const valueEl = document.getElementById("value");
const historyList = document.getElementById("historyList");

let playerChoice = "";
let userIP = "未知";
let history = [];

fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => userIP = data.ip)
  .catch(() => userIP = "获取失败");

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function updateDiceVisual(value) {
  const symbols = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  diceEl.textContent = symbols[value];
  valueEl.textContent = value;
}

function addHistory(value, choice, outcome) {
  const timestamp = new Date().toLocaleString();
  const record = {
    time: timestamp,
    ip: userIP,
    choice,
    dice: value,
    result: outcome.replace(/[^赢输]/g, "")
  };
  history.push(record);

  const li = document.createElement("li");
  li.textContent = `${timestamp} | IP: ${userIP} | 选【${choice === 'big' ? '大' : '小'}】，点数：${value} ➜ ${record.result}`;
  historyList.prepend(li);
}

function playRound() {
  if (!playerChoice) {
    alert("请先选择“大”或“小”！");
    return;
  }

  resultEl.textContent = "摇骰子中...";
  resultEl.style.color = "black";

  let counter = 0;
  const animation = setInterval(() => {
    const temp = rollDice();
    updateDiceVisual(temp);
    counter++;
    if (counter >= 10) {
      clearInterval(animation);
      const value = rollDice();
      updateDiceVisual(value);
      const isBig = value >= 4;
      const isSmall = value <= 3;
      let outcome = "";
      if ((isBig && playerChoice === "big") || (isSmall && playerChoice === "small")) {
        outcome = "🎉 赢！";
        resultEl.style.color = "green";
      } else {
        outcome = "😢 输了！";
        resultEl.style.color = "red";
      }
      resultEl.textContent = outcome;
      addHistory(value, playerChoice, outcome);
    }
  }, 80);
}

bigBtn.addEventListener("click", () => {
  playerChoice = "big";
  bigBtn.classList.add("selected");
  smallBtn.classList.remove("selected");
});
smallBtn.addEventListener("click", () => {
  playerChoice = "small";
  smallBtn.classList.add("selected");
  bigBtn.classList.remove("selected");
});
startBtn.addEventListener("click", playRound);
againBtn.addEventListener("click", playRound);
viewBtn.addEventListener("click", () => {
  const values = [];
  for (let i = 0; i < 10; i++) values.push(rollDice());
  alert("🎲 模拟 10 次点数结果：\n" + values.join(", "));
});
downloadBtn.addEventListener("click", () => {
  if (history.length === 0) {
    alert("当前没有历史记录可以下载！");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(history);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "历史记录");
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dice-history.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
