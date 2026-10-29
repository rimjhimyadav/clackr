export const SNIPPETS = [
  `function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
  `const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);`,
  `async function getUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}`,
  `export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
  `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`,
  `const byCity = users.reduce((groups, user) => {
  (groups[user.city] ??= []).push(user);
  return groups;
}, {});`,
  `function isPalindrome(text) {
  const clean = text.toLowerCase().replace(/[^a-z]/g, "");
  return clean === [...clean].reverse().join("");
}`,
  `const names = people
  .filter((person) => person.age >= 18)
  .map((person) => person.name)
  .sort();`,
];
