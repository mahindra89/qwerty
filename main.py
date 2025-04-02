import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.colors as mcolors

# Get variables from JS
# num_jobs, num_cpus, chunk_unit, job_data are set from JS
processes = []
for i in range(num_jobs):
    arrival, burst = job_data[i]
    processes.append({'id': f'J{i+1}', 'arrival_time': arrival, 'burst_time': burst})

# Then paste the rest of your STRF code starting from:
# "arrival_time = {..." through to the end.
# Do NOT include input() anywhere.

# At the end of your code, instead of plt.show(), use:
import base64
from io import BytesIO

buf = BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
buf.close()

from js import document
document.getElementById("chart").innerHTML = f"<img src='data:image/png;base64,{img_base64}'/>"
