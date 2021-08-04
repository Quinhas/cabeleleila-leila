// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  date?: string;
  message?: string;
};

export default async function getUnavailableHours(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const date = String(req.body.date);
  console.log(date);
  if (!date) {
    console.log("entrou aqui");
    res.status(400).json({ message: "Você deve fornecer uma data." });
  }
  res.status(200).json({ date: req.body.date });
}
