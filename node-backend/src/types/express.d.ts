declare module "express" {

  export interface Response<
    ResBody = any,
    LocalsObj extends Record<string, any> = Record<string, any>,
    StatusCode extends number = number,
  > {
    jsonSuccess: (data?: ResBody) => void,
  }
}


export {};
