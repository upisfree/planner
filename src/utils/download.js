export function download(filename, mime, data) {
  let blob = new Blob([data], { type: mime });

  let elem = document.createElement('a');
  elem.href = URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}
