import { Button, Form, Input, InputNumber, Progress } from "antd";
import { mockData } from "./mockData";
import type { MockDataEntity } from "./types";
import { decline } from "./utils";
import { useTable } from "./hooks/useTable";

const tableHeadCodes = ["date", "shift", "user", "jobCode"];

export const Table = () => {
  const {
    form,
    initialValues,
    counter,
    counterPercent,
    showCounter,
    contextHolder,
    onChangeFormValues,
    onResetProgress,
  } = useTable();

  return (
    <div className="wrapper">
      {contextHolder}
      <Form
        form={form}
        initialValues={initialValues}
        onValuesChange={onChangeFormValues}
        className="form__wrapper"
      >
        {Object.keys(mockData).map((key) => {
          const fieldKey = key as keyof MockDataEntity;
          if (fieldKey === "id") {
            return null;
          }
          const isPercentage = fieldKey === "percentage";
          return (
            <div
              key={fieldKey}
              className={`cell ${fieldKey}${
                tableHeadCodes.includes(fieldKey) ? " head" : ""
              }`}
            >
              {fieldKey === "user" ? (
                <div className="user__wrapper">
                  <Form.Item name="position" noStyle>
                    <Input variant="borderless" className="user__description" />
                  </Form.Item>
                  <Form.Item
                    name="name"
                    getValueFromEvent={(e) => {
                      const value = e?.target?.value ?? "";
                      return value.replace(/[^А-Яа-яЁё. ]/g, "");
                    }}
                    noStyle
                  >
                    <Input variant="borderless" className="user__name" />
                  </Form.Item>
                </div>
              ) : (
                <Form.Item name={fieldKey} noStyle>
                  {fieldKey === "comment" ? (
                    <Input.TextArea
                      variant="borderless"
                      className="input__textarea"
                      rows={7}
                    />
                  ) : typeof mockData[fieldKey] === "number" ? (
                    isPercentage ? (
                      <InputNumber
                        variant="borderless"
                        step={0.1}
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value) => (!value ? 0 : value)}
                      />
                    ) : (
                      <InputNumber
                        variant="borderless"
                        min={0}
                        parser={(value) => (!value ? 0 : value)}
                      />
                    )
                  ) : (
                    <Input variant="borderless" />
                  )}
                </Form.Item>
              )}
            </div>
          );
        })}
      </Form>
      <div
        className={`countdown__wrapper${
          showCounter ? " countdown__wrapper_visible" : ""
        }`}
      >
        Отправка данных через {counter}{" "}
        {decline(counter, ["секунду", "секунды", "секунд"])}
        <Progress
          percent={counterPercent}
          className="countdown__progress"
          showInfo={false}
          strokeColor="#FFAE12"
        />
        <Button onClick={onResetProgress} disabled={!showCounter}>
          Отмена
        </Button>
      </div>
    </div>
  );
};
