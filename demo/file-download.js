function downloadFile(data, name = 'myData.txt') {
  // https://developer.mozilla.org/en-US/docs/Web/API/Blob
  // 'application/octet-stream' means any kind of binary data
  const blob = new Blob([data], { type: 'application/octet-stream' });
  // unique link stored in memory
  const href = URL.createObjectURL(blob);

  const link = Object.assign(document.createElement('a'), {
    href,
    style: 'display: none',
    download: name,
  });
  document.body.appendChild(link);

  link.click();
  URL.revokeObjectURL(href);
  link.remove();
}
