// solution = {
//   a: "1",
//   b: "2",
//   c: "3",
// };
// for (const arr of Object.entries(solution)) {
//   console.log(arr);
// }
import axios from "axios"
import dotenv from "dotenv";
dotenv.config();
// Simple ping

const options = {
  method: 'GET',
  url: `${process.env.JUDGE0_API_URL}/languages`,
  headers: {Authorization: 'Bearer REMOVED_SECRET'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error("Error aya",error);
}