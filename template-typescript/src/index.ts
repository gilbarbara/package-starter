export function sleep(seconds = 0.1) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}
