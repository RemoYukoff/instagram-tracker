import { useState } from "preact/hooks";
import type { JSX } from "preact";
import type { ScanSettings } from "../storage/settings";

interface Props {
  settings: ScanSettings;
  onSave: (settings: ScanSettings) => void;
  onClose: () => void;
}

interface NumberFieldProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function NumberField({ label, value, step, min, disabled, onChange }: NumberFieldProps) {
  function handleInput(e: JSX.TargetedEvent<HTMLInputElement>) {
    const next = e.currentTarget.valueAsNumber;
    if (!Number.isNaN(next)) onChange(next);
  }

  return (
    <label class="settings-row">
      <span>{label}</span>
      <input type="number" value={value} step={step} min={min} disabled={disabled} onInput={handleInput} />
    </label>
  );
}

// All fields here are stored as-is in chrome.storage.local -- Save writes the
// whole object in one shot rather than field-by-field, so a half-edited form
// never partially persists.
export function Settings({ settings, onSave, onClose }: Props) {
  const [form, setForm] = useState<ScanSettings>(settings);

  function set<K extends keyof ScanSettings>(key: K, value: ScanSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div class="settings-overlay" onClick={onClose}>
      <div class="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <label class="settings-row settings-row--checkbox">
          <span>Automatic scan</span>
          <input
            type="checkbox"
            checked={form.autoScanEnabled}
            onChange={(e) => set("autoScanEnabled", e.currentTarget.checked)}
          />
        </label>

        <NumberField
          label="Scan interval (hours)"
          value={form.autoScanIntervalHours}
          min={1}
          step={1}
          disabled={!form.autoScanEnabled}
          onChange={(v) => set("autoScanIntervalHours", v)}
        />

        <h3>Rate limiting (advanced)</h3>
        <p class="settings-hint">
          Controls the pacing between page fetches during a scan. Lower values scan faster but carry
          more risk of Instagram rate-limiting or flagging the session.
        </p>

        <NumberField
          label="Base delay (ms)"
          value={form.baseDelayMs}
          min={0}
          step={100}
          onChange={(v) => set("baseDelayMs", v)}
        />
        <NumberField
          label="Base jitter min (×)"
          value={form.baseJitterMin}
          min={0}
          step={0.1}
          onChange={(v) => set("baseJitterMin", v)}
        />
        <NumberField
          label="Base jitter max (×)"
          value={form.baseJitterMax}
          min={0}
          step={0.1}
          onChange={(v) => set("baseJitterMax", v)}
        />
        <NumberField
          label="Micro-pause min (ms)"
          value={form.microPauseMinMs}
          min={0}
          step={100}
          onChange={(v) => set("microPauseMinMs", v)}
        />
        <NumberField
          label="Micro-pause max (ms)"
          value={form.microPauseMaxMs}
          min={0}
          step={100}
          onChange={(v) => set("microPauseMaxMs", v)}
        />
        <NumberField
          label="Long pause every N cycles"
          value={form.longPauseEveryNCycles}
          min={1}
          step={1}
          onChange={(v) => set("longPauseEveryNCycles", v)}
        />
        <NumberField
          label="Long pause (ms)"
          value={form.longPauseMs}
          min={0}
          step={500}
          onChange={(v) => set("longPauseMs", v)}
        />
        <NumberField
          label="Long pause jitter (ms)"
          value={form.longPauseJitterMs}
          min={0}
          step={500}
          onChange={(v) => set("longPauseJitterMs", v)}
        />

        <div class="settings-actions">
          <button class="scan-btn" onClick={() => onSave(form)}>
            Save
          </button>
          <button class="text-link settings-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
