export default {
  async request({ url, data, onMessage, onComplete, onError }) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        reader.read().then(function processText({ done, value }) {
          if (done) {
            onComplete && onComplete();
            return;
          }
          const message = decoder.decode(value);
          onMessage && onMessage(message);
          reader.read().then(processText);
        });
      } else {
        onError && onError(response.statusText);
        onComplete && onComplete();
      }
    } catch (error) {
      onError && onError(error);
      onComplete && onComplete();
    }
  },
};
