import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type RecordDialogMode = 'details' | 'edit' | 'create' | 'confirm';

export interface RecordField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  editable?: boolean;
  options?: (string | { value: string; label: string })[];
}

@Component({
  selector: 'app-record-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './record-dialog.html'
})
export class RecordDialog implements OnChanges {
  @Input({ required: true }) mode: RecordDialogMode = 'details';
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() fields: RecordField[] = [];
  @Input() values: Record<string, string | number> = {};
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<Record<string, string>>();
  @Output() readonly confirmed = new EventEmitter<void>();

  draft: Record<string, string> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['values']) {
      this.draft = Object.fromEntries(
        Object.entries(this.values).map(([key, value]) => [key, String(value)])
      );
    }
  }

  fieldValue(field: RecordField): string {
    const value = this.values[field.key] ?? '';
    if (field.key === 'image' && !value) return 'Aucune image';
    const option = field.options?.find((item) =>
      typeof item === 'string' ? item === String(value) : item.value === String(value)
    );
    return typeof option === 'string' ? option : option?.label ?? String(value);
  }

  optionValue(option: string | { value: string; label: string }): string {
    return typeof option === 'string' ? option : option.value;
  }

  optionLabel(option: string | { value: string; label: string }): string {
    return typeof option === 'string' ? option : option.label;
  }

  updateDraft(key: string, event: Event): void {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      this.draft = { ...this.draft, [key]: target.value };
    }
  }

  submit(formValid: boolean | null): void {
    if (formValid) this.saved.emit({ ...this.draft });
  }
}
