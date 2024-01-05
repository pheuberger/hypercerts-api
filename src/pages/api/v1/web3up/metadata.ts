import type { NextApiRequest, NextApiResponse } from "next";

import { validateMetaData } from "@hypercerts-org/sdk";
import { AnyLink } from "@web3-storage/w3up-client/dist/src/types";
import { jsonToBlob } from "@/utils";
import { setup } from "@/client";

type ResponseData = {
  message: string;
  cid?: AnyLink;
  errors?: Record<string, string | string[]>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const client = await setup();

    const reqData = req.body;

    const { data, valid, errors } = validateMetaData(reqData);

    if (!valid) {
      res.status(400).json({ message: "Errors in submitted data", errors });
      return;
    }

    const blob = jsonToBlob(data);

    const result = await client.uploadFile(blob);

    res.status(200).json({ message: "Data uploaded succesfully", cid: result });
  } else {
    res.status(405).json({ message: "Not allowed" });
  }
}
