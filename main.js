class DataManager {
  constructor(baseUrl, retries = 3) {
    this.baseUrl = baseUrl;
    this.retries = retries;
    this.cache = new Map();
  }

    async fetchWithRetry(endpoint) {
        let attempts = 0;
        const tryFetch = () => {
            return fetch(`${this.baseUrl}${endpoint}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
                return response.json();
            })
            .catch(err => {
                attempts++;
                if (attempts < this.retries) {
                console.warn(`Спроба ${attempts} не вдалася. Повтор...`);
                return tryFetch(); // повторна спроба
                } else {
                throw err;
                }
            });
        };
    return tryFetch();
    }


  async getData(endpoint) {
    if (this.cache.has(endpoint)) {
      console.log("✅ Дані з кешу");
      return this.cache.get(endpoint);
    }
    console.log("🌍 Завантаження з API...");
    const data = await this.fetchWithRetry(endpoint);
    this.cache.set(endpoint, data);
    return data;
  }

  async filterData(endpoint, predicate) {
    const data = await this.getData(endpoint);
    return data.filter(predicate);
  }

  async sortData(endpoint, compareFn) {
    const data = await this.getData(endpoint);
    return [...data].sort(compareFn);
  }
}

(async () => {
  const dm = new DataManager("https://jsonplaceholder.typicode.com");

  try {
    const users = await dm.getData("/users");
    console.log("Користувачі:", users);

    const filtered = await dm.filterData("/users", u => u.id < 5);
    console.log("Фільтровані користувачі:", filtered);

    const sorted = await dm.sortData("/users", (a, b) => a.name.localeCompare(b.name));
    console.log("Відсортовані користувачі:", sorted);

    const cached = await dm.getData("/users");
    console.log("Кешовані дані:", cached);

  } catch (err) {
    console.error("Помилка:", err.message);
  }
})();
