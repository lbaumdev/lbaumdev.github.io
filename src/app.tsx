import { useEffect, useState } from "preact/hooks";

import "./app.css";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import cronstrue from "cronstrue/i18n";
import DatePicker from "./components/DatePicker";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";

const errors = {
  "missing-end-date": "Enddatum ist erforderlich",
  "end-date-in-past": "Enddatum darf nicht in der Vergangenheit liegen",
};

type ErrorCode = keyof typeof errors | null;
type ValueState = {
  choice: string;
  amount: string;
  endDate: Date | undefined;
  errorCode: ErrorCode;
};

export function App() {
  let telegramSubmitButton: BottomButton;
  const in7Days = new Date(new Date().setDate(new Date().getDate() + 7));

  const [values, setValues] = useState<ValueState>({
    choice: "0",
    amount: "2",
    endDate: in7Days,
    errorCode: null,
  });

  const options = [
    {
      label: "Jede Stunde",
      cronExpression: "* * * * *",
    },
    {
      label: "Jede x Stunden",
      cronExpression: "0 */x * * *",
    },
  ];

  const getCronExpression = (choice: string, amount: string) => {
    if (choice === "0") {
      return options[0].cronExpression;
    }
    return options[1].cronExpression.replace("x", amount);
  };

  const getCronText = (expression: string) =>
    cronstrue.toString(expression, { locale: "de", use24HourTimeFormat: true });

  useEffect(() => {
    Telegram.WebApp.ready();
    telegramSubmitButton = Telegram.WebApp.MainButton.setText("Zeitplan speichern").show().disable();

    telegramSubmitButton.onClick(function () {
      if (!isValid(values)) return;

      const data = JSON.stringify({
        expression: getCronExpression(values.choice, values.amount),
        text: getCronText(getCronExpression(values.choice, values.amount)),
      });
      Telegram.WebApp.sendData(data);
      Telegram.WebApp.close();
    });
  });

  const isValid = (_values: ValueState, showError = true) => {
    const result: ValueState = {
      ..._values,
    };
    if (_values.endDate === undefined) {
      if (showError) {
        result["errorCode"] = "missing-end-date";
        setValues(result);
      }
      return false;
    }

    if (_values.endDate.getTime() < new Date().getTime()) {
      if (showError) {
        result["errorCode"] = "end-date-in-past";
        setValues(result);
      }
      return false;
    }

    telegramSubmitButton.enable();

    setValues({ ...result, errorCode: null });

    return true;
  };

  return (
    <>
      <span className="copyright">
        &copy; Copyright {new Date().getFullYear()} TMS ({COPYRIGHT})
      </span>
      <form>
        <RadioGroup
          defaultValue="0"
          onValueChange={(c) => {
            isValid({ ...values, choice: c });
          }}
          value={values.choice}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="c0" />
            <Label htmlFor="c0">Jede Stunde</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="c1" />
            <Label htmlFor="amount-hour">Alle</Label>
            <Select
              name="amount-hour"
              onValueChange={(v) => {
                isValid({ ...values, amount: v, choice: "1" });
              }}
              value={values.amount}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="x" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 22 }).map((_, i) => (
                  <SelectItem key={i + 2} value={`${i + 2}`}>
                    {i + 2}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="amount-hour">Stunden</Label>
          </div>
        </RadioGroup>

        <div className="mt-4 flex flex-col gap-4">
          Enddatum (Erforderlich)
          <DatePicker
            date={values.endDate}
            setDate={(newDate) => {
              isValid({ ...values, endDate: newDate });
            }}
          />
        </div>
      </form>
      {values.errorCode !== null && (
        <div className={"mt-4"}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors[values.errorCode]}</AlertDescription>
          </Alert>
        </div>
      )}
      {window.location.hash === "#debug" && (
        <div className={"mt-4"}>
          <pre>
            <code>
              {JSON.stringify(
                {
                  choice: values.choice,
                  amount: values.amount,
                  expression: getCronExpression(values.choice, values.amount),
                  text: getCronText(getCronExpression(values.choice, values.amount)),
                },
                null,
                2
              )}
            </code>
          </pre>
          <button onClick={() => console.log("Valid: " + isValid(values))}>Check</button>
        </div>
      )}
    </>
  );
}
