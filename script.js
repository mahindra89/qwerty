document.getElementById("jobForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const numJobs = parseInt(document.getElementById("numJobs").value);
  const numCPUs = parseInt(document.getElementById("numCPUs").value);
  const chunkUnit = parseFloat(document.getElementById("chunkUnit").value);

  const jobInputsDiv = document.getElementById("jobInputs");
  jobInputsDiv.innerHTML = `<h2>Enter Job Details</h2>`;

  for (let i = 0; i < numJobs; i++) {
    jobInputsDiv.innerHTML += `
      <label>Job J${i + 1} Arrival: <input type="number" step="0.1" id="arrival${i}" required></label>
      <label>Job J${i + 1} Burst: <input type="number" step="0.1" id="burst${i}" required></label>
    `;
  }

  jobInputsDiv.innerHTML += `<button onclick="simulate(${numJobs}, ${numCPUs}, ${chunkUnit})">Run Simulation</button>`;
});

function simulate(numJobs, numCPUs, chunkUnit) {
  const jobs = [];
  for (let i = 0; i < numJobs; i++) {
    const arrival = parseFloat(document.getElementById(`arrival${i}`).value);
    const burst = parseFloat(document.getElementById(`burst${i}`).value);
    jobs.push({ id: `J${i + 1}`, arrival, burst, remaining: burst });
  }

  let time = 0;
  let gantt = [];
  const endTimes = {};
  const startTimes = {};

  while (jobs.some(j => j.remaining > 0)) {
    const available = jobs.filter(j => j.arrival <= time && j.remaining > 0);
    available.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival);

    for (let cpu = 0; cpu < numCPUs; cpu++) {
      if (available.length === 0) break;

      const job = available.shift();
      if (!(job.id in startTimes)) startTimes[job.id] = time;

      const execTime = Math.min(chunkUnit, job.remaining);
      gantt.push({ job: job.id, cpu: cpu + 1, start: time, duration: execTime });

      job.remaining -= execTime;
      if (job.remaining <= 0) endTimes[job.id] = time + execTime;
    }

    time += chunkUnit;
  }

  displayResults(jobs, startTimes, endTimes);
  drawGanttChart(gantt, numCPUs);
}

function displayResults(jobs, start, end) {
  let output = "<pre>#Job  Arrival  Burst  Start  End  Turnaround\n";
  let totalTAT = 0;

  jobs.forEach(j => {
    const tat = end[j.id] - j.arrival;
    totalTAT += tat;
    output += `${j.id.padEnd(5)} ${j.arrival.toFixed(1).padEnd(8)} ${j.burst.toFixed(1).padEnd(6)} ${start[j.id].toFixed(1).padEnd(6)} ${end[j.id].toFixed(1).padEnd(6)} ${tat.toFixed(1)}\n`;
  });

  output += `\nAverage Turnaround Time: ${(totalTAT / jobs.length).toFixed(2)}</pre>`;

  document.getElementById("results").classList.remove("hidden");
  document.getElementById("output").innerHTML = output;
}

function drawGanttChart(gantt, numCPUs) {
  const canvas = document.getElementById("ganttChart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const colors = {};
  const colorList = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4"];
  const rowHeight = 30;

  gantt.forEach((block, i) => {
    if (!(block.job in colors)) {
      colors[block.job] = colorList[Object.keys(colors).length % colorList.length];
    }
    const x = block.start * 20;
    const y = (block.cpu - 1) * rowHeight;
    const w = block.duration * 20;
    ctx.fillStyle = colors[block.job];
    ctx.fillRect(x, y, w, rowHeight - 5);
    ctx.strokeRect(x, y, w, rowHeight - 5);
    ctx.fillStyle = "white";
    ctx.fillText(block.job, x + w / 2 - 5, y + rowHeight / 2);
  });

  for (let i = 0; i < numCPUs; i++) {
    ctx.fillStyle = "black";
    ctx.fillText(`CPU${i + 1}`, 5, i * rowHeight + 15);
  }
}
