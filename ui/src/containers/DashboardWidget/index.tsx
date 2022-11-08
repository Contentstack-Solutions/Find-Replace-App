/* Import React modules */
import React, { useCallback, useEffect, useState } from "react";
/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { Button, cbModal, DateTimePicker, Select, TextInput } from "@contentstack/venus-components";
import { TypeSDKData } from "../../common/types";
import "@contentstack/venus-components/build/main.css";
import set from "lodash.set";
import get from "lodash.get";

/* Import our modules */
/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";
import flatten from "common/utils/flatten";
import InfinteTable from "./table";
import utils from "common/utils";
import ReplaceModal from "components/modal";

/* To add any labels / captions for fields or any inputs, use common/local/en-us/index.ts */

const DashboardWidget: React.FC = function () {
  const [state, setState] = useState<TypeSDKData>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });
  const [stack, setStack] = useState<any>();
  const [contentTypeOptions, setContentTypeOptions] = useState<any>([]);
  const [localeOptions, setLocaleOptions] = useState<any>([]);
  const [entries, setEntries] = useState<any>([]);
  const [entryOptions, setEntryOptions] = useState<any>([]);
  const [preViewTable, setPreViewTable] = useState<any>([]);
  const [contentTypeValue, setContentTypeValue] = useState<any>(null);
  const [localeValue, setLocaleValue] = useState<any>(null);
  const [fieldValue, setFieldValue] = useState<any>(null);
  const [inputValue, setValue] = useState<any>(null);
  const [itemStatusMap, updateItemStatusMap] = useState({});
  const [totalCounts, updateTotalCounts] = useState(0);
  const [loading, updateLoading] = useState(false);
  const [selectedUids, setSelectedUids] = useState<any>([]);
  const [isNext, updateIsNext] = useState(false);
  const [replace, updateReplace] = useState<any>(null);
  const [status, setStatus] = useState(false);
  const [isHide, setIsHide] = useState(false);

  const optionsCreate = ({ data, label, value }: any) => {
    const result: any = [];
    data.forEach((item: any) => {
      result.push({
        label: item[label],
        value: item[value],
        data: item,
      });
    });
    return result;
  };




  useEffect(() => {
    ContentstackAppSdk.init()
      .then(async (appSdk) => {
        const config = await appSdk.getConfig();
        const stack = appSdk.stack;
        appSdk?.location?.DashboardWidget?.frame?.updateHeight(600);
        appSdk?.location?.DashboardWidget?.frame?.disableAutoResizing()
        const contentTypes = await stack.getContentTypes("", { include_count: true, include_global_field_schema: true });
        const locales = await stack.getLocales();
        setContentTypeOptions(
          optionsCreate({
            data: contentTypes.content_types,
            label: "title",
            value: "uid",
          })
        );
        setLocaleOptions(
          optionsCreate({ data: locales.locales, label: "name", value: "code" })
        );
        setStack(stack);
        setState({
          config,
          location: appSdk.location,
          appSdkInitialized: true,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleContentTypeUpdate = (data: any) => {
    if (data === null) {
      setLocaleValue(null);
      setFieldValue(null);
      setValue(null)
    }
    if (contentTypeValue?.value !== data?.value) {
      setStatus(false)
      setPreViewTable([])
      updateTotalCounts(0)
      setLocaleValue(null);
      setFieldValue(null);
      setValue(null)
    }
    setContentTypeValue(data);
  };

  const handleLoclesUpdate = (data: any) => {
    if (data === null) {
      setFieldValue(null);
      setValue(null)
    }
    setLocaleValue(data);
  };

  const getEntries = useCallback(async () => {
    try {
      if (localeValue?.value && contentTypeValue?.value) {
        const fieldData = utils.filedCreator({ schema: contentTypeValue?.data?.schema, contentTypeOptions: contentTypeOptions });
        let result: any = [];
        if (fieldData?.length) {
          for (const field of fieldData) {
            if (!field?.data?.field_metadata?.extension) {
              result.push({
                label: field.path,
                value: field.path,
                data: field.data,
                type: field.data.data_type,
              })
            }
          }
        }
        setEntryOptions(result);
      }
    } catch (err) {
      console.error("🚀 ~ file: index.tsx ~ line 84 ~ getEntries ~ err", err);
    }
  }, [localeValue]);

  useEffect(() => {
    getEntries();
  }, [getEntries]);

  const handleFieldValue = (data: any) => {
    if (data === null) {
      setValue(null)
    }
    if (fieldValue?.label !== data?.label) {
      setValue(null)
    }
    setFieldValue(data);
  };

  const updateValue = (e: any) => {
    let { value } = e.target;
    setValue(value);
  };

  const handleClick = async ({
    skip = 0,
    limit = 30,
    sortBy = {},
    searchText = "",
  }: any) => {
    try {
      if (
        fieldValue?.label &&
        contentTypeValue?.value &&
        localeValue?.value &&
        inputValue
      ) {
        let findQuery = ["number"].includes(fieldValue?.type) ? inputValue : `{ "$regex": "${inputValue}", "$options": "i"}`;
        if (fieldValue?.type === "isodate") {
          findQuery = `"${inputValue}"`
        }
        if (fieldValue?.type === "boolean") {
          findQuery = inputValue?.value
        }
        if (fieldValue?.data?.display_type === "dropdown") {
          if (fieldValue?.data?.multiple) {
            findQuery = `{ "$in":  [${inputValue?.map((item: any) => `"${item.value}"`)}] }`
          } else {
            findQuery = inputValue?.value
          }
        }
        const query = `{
        "$and": [
          {
            "${fieldValue?.label}": ${findQuery}
          },
          {
            "title": {
              "$regex": "^${searchText}",
              "$options": "i"
            }
          }
        ]
      }`;
        updateLoading(true);
        const entry = await stack
          .ContentType(contentTypeValue.value)
          .Entry.Query()
          .language(localeValue?.value)
          .addQuery(`query`, query)
          .addQuery("include_count", "true")
          .addQuery(`${sortBy?.sortingDirection}`, `${sortBy?.id}`)
          .skip(skip)
          .limit(limit)
          .find();
        let result: any = [];
        const itemStatus: any = {};
        if (entry && entry?.entries?.length) {
          entry.entries.forEach((item: any, index: number) => {
            const flat = flatten(item);
            Object.entries(flat).forEach(([key, value]: any) => {
              const replaceKey = utils.keyReplacer(key)
              if (replaceKey === fieldValue.label) {
                if (fieldValue?.type === "boolean") {
                  if (value === inputValue?.value) {
                    itemStatus[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: key,
                      value: `${value}`,
                    });
                  }
                } else if (fieldValue?.type === "number") {
                  if (value === parseInt(inputValue)) {
                    itemStatus[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: key,
                      value: value,
                    });
                  }
                } else {
                  if (typeof inputValue === "object") {
                    itemStatus[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: replaceKey,
                      value: `${get(item, replaceKey)}`,
                    });
                  } else if (typeof value === "string") {
                    const newValue = value.toLowerCase();
                    if (newValue.includes(inputValue?.toLowerCase())) {
                      itemStatus[index] = "loaded";
                      result.push({
                        uid: item.uid,
                        title: item.title,
                        fieldName: key,
                        value: value,
                      });
                    }
                  }
                }
              }
            });
          });
          updateItemStatusMap(itemStatus);
          updateTotalCounts(entry.count);
          setEntries(entry?.entries);
          setStatus(false);
        } else {
          updateTotalCounts(entry.count);
        }
        result = result?.filter(function (item: any, pos: any, self: any) {
          return self.findIndex((v: any) => v.uid === item.uid) === pos;
        });
        setPreViewTable(result);
        updateLoading(false);
      }
    } catch (err) {
      console.error("🚀 ~ file: index.tsx ~ line 194 ~ handleClick ~ err", err);
    }
  };

  const loadMoreItems = async ({
    skip,
    limit,
    stopIndex,
    startIndex,
    sortBy = {},
    searchText = "",
  }: any) => {
    try {
      if (
        fieldValue?.label &&
        contentTypeValue?.value &&
        localeValue?.value &&
        inputValue
      ) {
        let itemStatusMapCopy: any = { ...itemStatusMap };
        for (let index = startIndex; index <= stopIndex; index++) {
          itemStatusMapCopy[index] = "loading";
        }
        let findQuery = ["number"].includes(fieldValue?.type) ? inputValue : `{ "$regex": "${inputValue}", "$options": "i"}`;
        if (fieldValue?.type === "isodate") {
          findQuery = `"${inputValue}"`
        }
        if (fieldValue?.type === "boolean") {
          findQuery = inputValue?.value
        }
        if (fieldValue?.data?.display_type === "dropdown") {
          if (fieldValue?.data?.multiple) {
            findQuery = `{ "$in":  [${inputValue?.map((item: any) => `"${item.value}"`)}] }`
          } else {
            findQuery = inputValue?.value
          }
        }
        const query = `{
            "$and": [
              {
                      "${fieldValue?.label}": ${findQuery}
              },
              {
                "title": {
                  "$regex": "^${searchText}",
                    "$options": "i"
                }
              }
        ]
      }`;
        updateItemStatusMap({ ...itemStatusMapCopy });
        updateLoading(true);
        const entry = await stack
          .ContentType(contentTypeValue.value)
          .Entry.Query()
          .language(localeValue?.value)
          .addQuery(`query`, query)
          .addQuery("include_count", "true")
          .addQuery(`${sortBy?.sortingDirection} `, `${sortBy?.id} `)
          .skip(skip)
          .limit(limit)
          .find();
        let result: any = [];
        let updateditemStatusMapCopy: any = { ...itemStatusMap };
        if (entry && entry?.entries?.length) {
          entry.entries.forEach((item: any, index: number) => {
            const flat = flatten(item);
            Object.entries(flat).forEach(([key, value]: any) => {
              const replaceKey = utils.keyReplacer(key)
              if (replaceKey === fieldValue.label) {
                if (fieldValue?.type === "boolean") {
                  if (value === inputValue?.value) {
                    updateditemStatusMapCopy[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: key,
                      value: `${value}`,
                    });
                  }
                } else if (fieldValue?.type === "number") {
                  if (value === parseInt(inputValue)) {
                    updateditemStatusMapCopy[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: key,
                      value: value,
                    });
                  }
                } else {
                  if (typeof inputValue === "object") {
                    updateditemStatusMapCopy[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: replaceKey,
                      value: `${get(item, replaceKey)}`,
                    });
                  } else if (typeof value === "string") {
                    const newValue = value.toLowerCase();
                    if (newValue.includes(inputValue?.toLowerCase())) {
                      updateditemStatusMapCopy[index] = "loaded";
                      result.push({
                        uid: item.uid,
                        title: item.title,
                        fieldName: key,
                        value: value,
                      });
                    }
                  }
                }
              }
            });
          });
          updateTotalCounts(entry.count);
          setEntries([...entries, ...entry?.entries]);
          updateItemStatusMap({ ...updateditemStatusMapCopy });
        }
        result = result?.filter(function (item: any, pos: any, self: any) {
          return self.findIndex((v: any) => v.uid === item.uid) === pos;
        });
        setPreViewTable([...preViewTable, ...result]);
        updateLoading(false);
      }
    } catch (err) {
      console.error("🚀 ~ file: index.tsx ~ line 239 ~ loadMoreItems ~ err", err);
    }
  };

  const getSelectedRow = (data: any) => {
    setSelectedUids(data);
  };

  const handleNextClick = () => {
    updateIsNext(true);
  };

  const replaceValue = (e: any) => {
    let { value } = e.target;
    updateReplace(value);
  };

  const handleReplaceClick = async (props: any) => {
    try {
      if (selectedUids?.length) {
        updateLoading(true);
        const reslut = [];
        if (preViewTable?.length) {
          for (let entryPos = 0; entryPos < preViewTable.length; entryPos++) {
            const preview = preViewTable[entryPos];
            const entry = entries.find((item: any) => item.uid === preview.uid)
            if (preview?.uid === entry?.uid) {
              if (selectedUids.includes(entry?.uid)) {
                utils.assetUidReplace({ entry });
                let stringData = get(entry, preview?.fieldName)
                let newReplace = replace;
                switch (fieldValue?.type) {
                  case "number":
                    newReplace = parseInt(newReplace);
                    set(entry, preview?.fieldName, newReplace);
                    break;

                  case "boolean":
                    newReplace = newReplace.value;
                    set(entry, preview?.fieldName, newReplace);
                    break;

                  default:
                    if (fieldValue?.data?.display_type === "dropdown") {
                      if (fieldValue?.data?.multiple) {
                        const findQuery = newReplace?.map((item: any) => item.value);
                        set(entry, preview?.fieldName, findQuery);
                      } else {
                        const findQuery = newReplace?.value
                        set(entry, preview?.fieldName, findQuery);
                      }
                    } else {
                      if (typeof stringData === "string") {
                        const regex = new RegExp(inputValue, 'gi');
                        const newInput: any = stringData.match(regex)
                        if (newInput?.length) {
                          // stringData = replaceLodash(stringData, newInput[0], newReplace);
                          stringData = stringData.replaceAll(newInput[0], newReplace)
                          set(entry, preview?.fieldName, stringData);
                        }
                      }
                    }
                    break;
                }
                try {
                  let response = await stack
                    .ContentType(contentTypeValue?.value)
                    .Entry(entry.uid)
                    .update({ entry }, localeValue?.value);
                  response.entry.notice = response.notice;
                  reslut.push(response?.entry);
                } catch (err) {
                  let message
                  if (err instanceof Error) {
                    message = JSON.parse(err.message);
                    if (message?.status === 422) {
                      const res: any = entry;
                      res.notice = message?.data?.error_message;
                      reslut.push(res)
                    } else {
                      console.log(err)
                    }
                  }
                  console.log(err);
                }
              }
            }
          }
        }
        const updatedEntries: any = await Promise.all(reslut);
        if (updatedEntries && updatedEntries?.length) {
          const itemStatus: any = {};
          let result: any = [];
          updatedEntries.forEach((item: any, index: number) => {
            const flat = flatten(item);
            Object.entries(flat).forEach(([key, value]: any) => {
              const replaceKey = utils.keyReplacer(key)
              if (replaceKey === fieldValue.label) {
                if (fieldValue?.type === "boolean") {
                  itemStatus[index] = "loaded";
                  result.push({
                    uid: item.uid,
                    title: item.title,
                    fieldName: key,
                    value: `${value}`,
                    status: item.notice,
                  });
                } else if (fieldValue?.type === "number") {
                  if (value === parseInt(replace)) {
                    itemStatus[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: key,
                      value: value,
                      status: item.notice,
                    });
                  }
                } else {
                  const objectValue = get(item, replaceKey)
                  if (typeof replace === "object") {
                    itemStatus[index] = "loaded";
                    result.push({
                      uid: item.uid,
                      title: item.title,
                      fieldName: replaceKey,
                      status: item.notice,
                      value: `${objectValue}`,
                    });
                  } else if (typeof value === "string") {
                    const newValue = value.toLowerCase();
                    if (newValue.includes(replace?.toLowerCase())) {
                      itemStatus[index] = "loaded";
                      result.push({
                        uid: item.uid,
                        title: item.title,
                        fieldName: key,
                        value: `${value}`,
                        status: item.notice,
                      });
                    }
                  }
                }
              }
            }
            );
          });
          updateItemStatusMap(itemStatus);
          setPreViewTable(result);
          updateTotalCounts(reslut?.length);
          setStatus(true);
          updateReplace(null);
        }
        updateIsNext(false);
        updateLoading(false);
        setSelectedUids([]);
        setContentTypeValue(null);
        setLocaleValue(null);
        setValue(null);
        setFieldValue(null);
        props.closeModal()
      }
    } catch (err) {
      props.closeModal()
      console.error(
        "🚀 ~ file: index.tsx ~ line 235 ~ handleReplaceClick ~ err",
        err
      );
    }
  };


  const handleModal = () => {
    cbModal({
      component: (props: any) => <ReplaceModal {...props} handleReplaceClick={handleReplaceClick} loading={loading} selectedUids={selectedUids} />,
      modalProps: {
        onClose: () => { },
        onOpen: () => { },
      },
      testId: 'cs-modal-storybook',
    })
  }

  const handleNewSelect = (data: any) => {
    setValue(data);
    setIsHide(false);
  }

  const handleReplaceSelect = (data: any) => {
    updateReplace(data);
    setIsHide(false);
  }


  const inputBuider = (isReplace: boolean) => {
    if (isReplace) {
      switch (fieldValue?.type) {
        case "boolean":
          return <Select
            value={replace}
            onChange={handleReplaceSelect}
            options={[{ label: "True", value: true }, { label: "False", value: false }]}
            placeholder={"Select Value"}
            isSearchable
            noOptionsMessage={() => "There are no value available"}
          />

        case "isodate":
          const ms = new Date().getTime() + 1689884260000
          const endDate = new Date(ms).toISOString()
          return <>
            <TextInput
              id="value"
              value={replace ?? ""}
              type={fieldValue?.type}
              placeholder="Add Replace Value"
              name="value"
              isReadOnly={true}
              onClick={() => setIsHide(true)}
            />
            {
              isHide && < DateTimePicker
                initialDate={replace ?? new Date().toISOString()}
                startDate={"2000-10-05T14:48:00.000Z"}
                endDate={endDate}
                onCancel={() => { setIsHide(false) }}
                onDone={handleReplaceSelect}
              />
            }
          </>

        default:
          if (fieldValue?.data?.display_type === "dropdown") {
            const newOptions: any = fieldValue?.data?.enum?.choices.map((item: any) => ({ label: item.key, ...item }))
            return <Select
              value={replace}
              onChange={handleReplaceSelect}
              options={newOptions ?? []}
              placeholder={"Select Value"}
              isSearchable
              isMulti={fieldValue?.data?.multiple ?? false}
              noOptionsMessage={() => "There are no value available"}
            />
          } else {
            return <TextInput
              id="value"
              required
              value={replace ?? ""}
              type={fieldValue?.type}
              placeholder="Add Replace Value"
              name="value"
              onChange={replaceValue}
            />
          }
      }
    } else {

      switch (fieldValue?.type) {
        case "boolean":
          return <Select
            value={inputValue}
            onChange={handleNewSelect}
            options={[{ label: "True", value: true }, { label: "False", value: false }]}
            placeholder={"Select Value"}
            isSearchable
            noOptionsMessage={() => "There are no value available"}
          />

        case "isodate":
          const ms = new Date().getTime() + 1689884260000
          const endDate = new Date(ms).toISOString()
          return <>
            <TextInput
              id="value"
              type={fieldValue?.type}
              value={inputValue ?? ""}
              placeholder="Select a Date"
              name="value"
              isReadOnly={true}
              onClick={() => setIsHide(true)}
            />
            {isHide && < DateTimePicker
              initialDate={inputValue ?? new Date().toISOString()}
              startDate={"2000-10-05T14:48:00.000Z"}
              endDate={endDate}
              onCancel={() => { setIsHide(false) }}
              onDone={handleNewSelect}
            />
            }
          </>

        default:
          if (fieldValue?.data?.display_type === "dropdown") {
            const newOptions: any = fieldValue?.data?.enum?.choices.map((item: any) => ({ label: item.key, ...item }))
            return <Select
              value={inputValue}
              onChange={handleNewSelect}
              options={newOptions ?? []}
              placeholder={"Select Value"}
              isSearchable
              isMulti={fieldValue?.data?.multiple ?? false}
              noOptionsMessage={() => "There are no value available"}
            />
          } else {
            return <TextInput
              id="value"
              required
              type={fieldValue?.type}
              value={inputValue ?? ""}
              placeholder="Search a Value"
              name="value"
              onChange={updateValue}
            />
          }
      }
    }
  }




  return (
    <>
      {state.appSdkInitialized && (
        <>
          <div className="main-Conatiner">
            {isNext ? (
              <div className="next-conatiner">
                <div className=" next-input-conatiner">
                  {inputBuider(true)}
                </div>
                <div className="next-button-conatiner"  >
                  <Button
                    onClick={handleModal}
                    buttonType="primary"
                    iconAlignment="left"
                    icon="TransferOwnership"
                    className="preview-button"
                    disabled={!replace}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <div className="intial-Conatiner">
                <div className="select-conatiner">
                  <Select
                    value={contentTypeValue}
                    onChange={handleContentTypeUpdate}
                    options={contentTypeOptions}
                    placeholder={"Select ContentType"}
                    isSearchable
                    isClearable
                    noOptionsMessage={() =>
                      "There are no ContentTypes available"
                    }
                  />
                  <Select
                    value={localeValue}
                    onChange={handleLoclesUpdate}
                    options={localeOptions}
                    placeholder={"Select Locale"}
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "There are no Locales available"}
                  />
                  <Select
                    value={fieldValue}
                    onChange={handleFieldValue}
                    options={entryOptions}
                    placeholder={"Select Field"}
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "There are no Field available"}
                  />
                  <div className="input-conatiner">
                    {inputBuider(false)}
                  </div>
                </div>
                <div className="button-conatiner"  >
                  <Button
                    onClick={handleClick}
                    buttonType="primary"
                    iconAlignment="left"
                    icon="Search"
                    className="preview-button"
                    disabled={selectedUids?.length}
                  >
                    Search
                  </Button>
                  <Button
                    onClick={handleNextClick}
                    buttonType="primary"
                    iconAlignment="left"
                    icon="Proceed"
                    className="preview-button"
                    disabled={!selectedUids?.length || status}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            <div className="table-Conatiner">
              <InfinteTable
                data={preViewTable}
                itemStatusMap={itemStatusMap}
                fetchData={handleClick}
                loadMoreItems={loadMoreItems}
                totalCounts={totalCounts}
                loading={loading}
                getSelectedRow={getSelectedRow}
                status={status}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardWidget;
