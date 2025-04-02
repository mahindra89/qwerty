let pyodideReady = false;
let pyodide;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage(["matplotlib"]);
  await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
`);
  pyodideReady = true;
}

loadPyodideAndPackages();

document.getElementById("numJobs").addEventListener("change", generateJobInputs);
generateJobInputs();

function generateJobInputs() {
  const numJobs = parseInt(document.getElementById("numJobs").value);
  const container = document.getElementById("jobsContainer");
  container.innerHTML = "<h3>Job Details</h3>";

  for (let i = 0; i < numJobs; i++) {
    container.innerHTML += `
      <label>Job J${i + 1} Arrival: <input type="number" step="0.1" id="arrival${i}" value="${i}" required></label>
      <label>Job J${i + 1} Burst: <input type="number" step="0.1" id="burst${i}" value="2" required></label>
      <hr />
    `;
  }
}

document.getElementById("inputForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!pyodideReady) return;

  const numJobs = parseInt(document.getElementById("numJobs").value);
  const numCPUs = parseInt(document.getElementById("numCPUs").value);
  const chunkUnit = parseFloat(document.getElementById("chunkUnit").value);

  let jobData = [];
  for (let i = 0; i < numJobs; i++) {
    const arrival = parseFloat(document.getElementById(`arrival${i}`).value);
    const burst = parseFloat(document.getElementById(`burst${i}`).value);
    jobData.push([arrival, burst]);
  }

  pyodide.globals.set("num_jobs", numJobs);
  pyodide.globals.set("num_cpus", numCPUs);
  pyodide.globals.set("chunk_unit", chunkUnit);
  pyodide.globals.set("job_data", jobData);

  const response = await fetch("main.py");
  const code = await response.text();

  await pyodide.runPythonAsync(code);
  const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
  document.getElementById("pyOutput").value = output;
});
