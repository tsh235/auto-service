export const fetchData = async () => {
  try {
    const response = await fetch('https://succinct-reliable-heron.glitch.me/api');

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении данных', error);
  }
};