import { TypePopupWindowDetails } from "../types";
import set from "lodash.set";
import get from "lodash.get";
import has from "lodash.has";
const ASSET_CHECKER = ".content_type";

const filterFetchedArray = (array: any[]) => {
  const tempFetchedList = [...array];
  const fetchedList = Array.from(new Set(tempFetchedList.map((a) => a.id))).map(
    (id) => tempFetchedList.find((a) => a.id === id)
  );
  return fetchedList;
};

const popupWindow = (windowDetails: TypePopupWindowDetails) => {
  const left = window.screen.width / 2 - windowDetails.w / 2;
  const top = window.screen.height / 2 - windowDetails.h / 2;
  return window.open(
    windowDetails.url,
    windowDetails.title,
    "toolbar=no, location=no, directories=no, " +
    "status=no, menubar=no, scrollbars=no, resizable=no, " +
    `copyhistory=no, width=${windowDetails.w}, ` +
    `height=${windowDetails.h}, ` +
    `top=${top}, left=${left}`
  );
};

const mergeObjects = (target: any, source: any) => {
  // Iterate through `source` properties and if an `Object` then
  // set property to merge of `target` and `source` properties
  Object.keys(source)?.forEach((key) => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeObjects(target[key], source[key]));
    }
  });

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};

const flatten = (data: any) => {
  var result: any = {};
  function recurse(cur: any, prop: string) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + "[" + i + "]");
      if (l == 0) result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
};



const assetUidReplace = ({ entry }: any) => {
  const result = []
  const flat = flatten(entry)
  for (const [key, value] of Object.entries(flat)) {
    if (key.includes(ASSET_CHECKER)) {
      if (has(entry, key)) {
        if (get(entry, key) === value) {
          const path = key.replace(ASSET_CHECKER, "")
          if (path) {
            const assetsObject = get(entry, path)
            if (assetsObject && assetsObject?.url && assetsObject?.filename) {
              result.push({ assetInfo: assetsObject, path })
            }
          }
        }
      }
    }
  }
  if (result?.length) {
    for (const item of result) {
      set(entry, item.path, item.assetInfo.uid)
    }
  }
}


const keyReplacer = (string: string) => {
  let key = string;
  if (key.includes("[") && key.includes("]")) {
    for (let p = 0; p < 100; p++) {
      key = key.replaceAll(`[${p}]`, "");
    }
  }
  return key;
}

const filedCreator = ({ schema, data = { path: "" }, contentTypeOptions }: any) => {
  let result: any = [];

  for (let schemaPos = 0; schemaPos < schema.length; schemaPos++) {
    const field = schema[schemaPos];
    if (field.data_type === "blocks") {
      for (let modulerPos = 0; modulerPos < field.blocks.length; modulerPos++) {
        if (
          field?.blocks[modulerPos] &&
          field?.blocks[modulerPos]?.schema &&
          field?.blocks[modulerPos]?.schema.length > 0
        ) {
          const newData = {
            path: data.path !== ""
              ? `${data.path}.${field.uid}.${field.blocks[modulerPos].uid}`
              : `${field.uid}.${field.blocks[modulerPos].uid}`,
            data: field.blocks[modulerPos],
          }
          result.push(
            ...filedCreator({ schema: field.blocks[modulerPos].schema, data: newData, contentTypeOptions })
          );
        } else {
          const newData = {
            path: data.path !== ""
              ? `${data.path}.${field.uid}.${field.blocks[modulerPos].uid}`
              : `${field.uid}.${field.blocks[modulerPos].uid}`,
            data: field.blocks[modulerPos],
          }
          result.push(newData);
        }
      }
    }

    const newData: any = {
      path: data.path !== ""
        ? `${data.path}.${field.uid}`
        : `${field.uid}`,
      data: field
    }
    result.push(newData);
    if (field?.schema && field.schema.length > 0) {
      result.push(...filedCreator({ schema: field.schema, data: newData, contentTypeOptions }));
    }
  }
  if (result.length > 0) {
    result = result.filter(function (item: any, pos: any, self: any) {
      if (!["file", "json", "group", "global_field", "blocks", "reference"].includes(item?.data?.data_type)) {
        return self.findIndex((v: any) => v.path === item.path) === pos;
      }
    });
  }
  return result;
};


const utils = {
  popupWindow,
  filterFetchedArray,
  mergeObjects,
  assetUidReplace,
  keyReplacer,
  filedCreator,
  ASSET_CHECKER
};

export default utils;
