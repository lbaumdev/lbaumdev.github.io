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

export function App() {
  const telegramSubmitButton = Telegram.WebApp.MainButton.setText("Zeitplan speichern").show().disable();
  const in7Days = new Date(new Date().setDate(new Date().getDate() + 7));

  const [choice, setChoice] = useState("0");
  const [amount, setAmount] = useState("2");
  const [endDate, setEndDate] = useState<Date | undefined>(in7Days);

  const [errorCode, setErrorCode] = useState<keyof typeof errors | null>(null);
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
    telegramSubmitButton.onClick(function () {
      if (!isValid(true)) return;

      const data = JSON.stringify({
        expression: getCronExpression(choice, amount),
        text: getCronText(getCronExpression(choice, amount)),
      });
      Telegram.WebApp.sendData(data);
      Telegram.WebApp.close();
    });
  });

  const isValid = (showError = true) => {
    if (endDate === undefined) {
      showError && setErrorCode("missing-end-date");
      return false;
    }

    if (endDate < new Date()) {
      showError && setErrorCode("end-date-in-past");
      return true;
    }

    showError && setErrorCode(null);
    return true;
  };

  if (errorCode === null && isValid()) {
    telegramSubmitButton.enable();
  }

  return (
    <>
      <form>
        <RadioGroup defaultValue="0" onValueChange={(c) => setChoice(c)} value={choice}>
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
                setChoice("1");
                setAmount(v);
              }}
              value={amount}
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
          <DatePicker date={endDate} setDate={(newDate) => setEndDate(newDate)} />
        </div>
      </form>
      {errorCode !== null && (
        <div className={"mt-4"}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors[errorCode]}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className={"mt-4"}>
        {window.location.hash === "#debug" && (
          <pre>
            <code>
              {JSON.stringify(
                {
                  choice,
                  amount,
                  expression: getCronExpression(choice, amount),
                  text: getCronText(getCronExpression(choice, amount)),
                },
                null,
                2
              )}
            </code>
          </pre>
        )}
      </div>
    </>
  );
}
