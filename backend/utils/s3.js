import AWS from "aws-sdk";


const s3Controller = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_BUCKET;

  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    region: process.env.AWS_DEFAULT_REGION || "SouthJkt-a",
    endpoint: process.env.AWS_ENDPOINT || "s3.amazonaws.com",
  });


  const createS3Key = ({ provider, mime, path, filename }) => {
    const now = new Date().getTime();
    const appName = process.env.APP_NAME || "default";
    //          apjiidc/     6285156815391/    8259637358022    - 6287786965543-1740362641977.jpeg
    // apjiidc/kabeltelekom/spacex/
    const key = `${appName}/${provider}/${path}/${filename}-${now}.${mime}`;
    return key;
  };

  async function uploadFile({ buffer, mimeType, provider, filename, path = '/' }) {
    try {
      const key = createS3Key({
        provider,
        mime: mimeType.split("/")[1],
        path,
        filename
      });
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ACL: "public-read",
        ContentType: mimeType,
      };
      await s3.upload(params).promise();
      return key;
    } catch (error) {
      throw error;
    }
  }
  async function getTemporaryUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expiresIn,
      };
      const url = await s3.getSignedUrlPromise("getObject", params);
      return url;
    } catch (error) {
      throw error
    }
  }
  async function getAllKey(path) {
    try {
      const params = {
        Bucket: bucketName,
        Prefix: `apjiidc/${path}/`,
        MaxKeys: 10,
      };
      const data = await s3.listObjectsV2(params).promise();
      return data;
    } catch (error) {
      throw error
    }
  }
  return {
    uploadFile,
    getTemporaryUrl,
    getAllKey,
    createS3Key,
  };
};

export const s3Con = s3Controller();

export const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      const type = reader.result.split(",")[0];
      resolve({ type, base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
