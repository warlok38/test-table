import { Form, message } from "antd";
import type { FormValuesType } from "../types";
import { mockData } from "../mockData";
import { useFormTimer } from "./useFormTimer";
import { areObjectsEqual, fakeApi } from "../utils";
import { useCallback, useMemo } from "react";

export const useTable = () => {
  const [form] = Form.useForm<FormValuesType>();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    date,
    shift,
    jobCode,
    staffTitle,
    staffCount,
    code,
    status,
    count,
    markCode,
    percentage,
    note,
    comment,
  } = mockData;

  const initialValues: FormValuesType = useMemo(
    () => ({
      date,
      shift,
      jobCode,
      staffTitle,
      staffCount,
      code,
      status,
      count,
      markCode,
      percentage,
      note,
      comment,
      name: mockData.user.name,
      position: mockData.user.position,
    }),
    [
      code,
      comment,
      count,
      date,
      jobCode,
      markCode,
      note,
      percentage,
      shift,
      staffCount,
      staffTitle,
      status,
    ]
  );

  const { showCounter, counter, counterPercent, startTimer, resetTimer } =
    useFormTimer({
      onCountdownEnd: () => {
        const currentValues = form.getFieldsValue();
        if (!areObjectsEqual(currentValues, initialValues)) {
          submitHandler(currentValues);
        }
      },
    });

  const submitHandler = async (values: FormValuesType) => {
    try {
      await fakeApi(values);
      messageApi.success("Данные успешно отправлены!");
    } catch {
      messageApi.error("Ошибка при отправке данных.");
    }
  };

  const changeValuesHandler = useCallback(
    (_changedValues: FormValuesType, values: FormValuesType) => {
      resetTimer();

      if (areObjectsEqual(values, initialValues)) {
        return;
      }

      startTimer();
    },
    [initialValues, resetTimer, startTimer]
  );

  const resetProgressHandler = useCallback(() => {
    resetTimer();
    form.resetFields();
  }, [form, resetTimer]);

  return {
    form,
    initialValues,
    counter,
    counterPercent,
    showCounter,
    contextHolder,
    onChangeFormValues: changeValuesHandler,
    onResetProgress: resetProgressHandler,
  };
};
