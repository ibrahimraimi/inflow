import axios from "axios";

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const fetcherWithParams = ([url, params]: [
  string,
  Record<string, string | number | boolean | undefined | null>,
]) => axios.get(url, { params }).then((res) => res.data);
