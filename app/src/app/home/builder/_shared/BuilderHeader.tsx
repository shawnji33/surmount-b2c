'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, FloppyDisk, Lightning, PencilSimple, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import s from './BuilderHeader.module.css';

// Two shapes: a static `title` (matches the Figma "ETF Builder" header — name/description
// editing has moved into AllocationSection's hero for that page) or an editable name/description
// pair (the original inline-edit header, still used where there's no hero to relocate it into).
// `title` stays a plain string (it's the discriminant `props.title !== undefined` narrows on —
// widening it to ReactNode would make that check stop narrowing correctly); a caller that wants a
// badge alongside it passes `titleBadge` instead.
type BuilderHeaderProps =
  | {
      title: string;
      titleBadge?: ReactNode;
      onSave: () => void;
      saveDisabled?: boolean;
      onDeploy: () => void;
      onClose: () => void;
      name?: undefined;
    }
  | {
      title?: undefined;
      name: string;
      setName: (v: string) => void;
      description: string;
      setDescription: (v: string) => void;
      onDeploy: () => void;
      onClose?: () => void;
    };

export function BuilderHeader(props: BuilderHeaderProps) {
  const [nameFocused, setNameFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  if (props.title !== undefined) {
    const { title, titleBadge, onSave, saveDisabled, onDeploy, onClose } = props;
    return (
      <div className={s.header}>
        <div className={s.titleRow}>
          <h1 className={s.title}>{title}</h1>
          {titleBadge}
        </div>

        <div className={s.actions}>
          <Button type="button" variant="outline" size="lg" onClick={onSave} disabled={saveDisabled}>
            <FloppyDisk weight="regular" aria-hidden="true" />
            <span>Save</span>
          </Button>
          <Button type="button" size="lg" onClick={onDeploy}>
            <Lightning weight="regular" aria-hidden="true" />
            <span>Deploy</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={onClose}
            aria-label="Close"
          >
            <X weight="regular" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  const { name, setName, description, setDescription, onDeploy } = props;
  return (
    <div className={s.header}>
      <Link href="/home/builder" className={s.backBtn} aria-label="Back to Create">
        <ArrowLeft weight="regular" />
      </Link>

      <div className={s.titleGroup}>
        <div className={[s.nameRow, nameFocused ? s.rowFocused : ''].filter(Boolean).join(' ')}>
          <input
            className={s.nameInput}
            value={name}
            maxLength={40}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            onChange={(e) => setName(e.target.value)}
            aria-label="Strategy name"
          />
          <PencilSimple weight="regular" className={s.editIcon} aria-hidden="true" />
          {nameFocused && <span className={s.counter}>{name.length}/40</span>}
        </div>
        <div className={[s.descRow, descFocused ? s.rowFocused : ''].filter(Boolean).join(' ')}>
          <input
            className={s.descInput}
            value={description}
            maxLength={60}
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Strategy description"
          />
          {descFocused && <span className={s.counter}>{description.length}/60</span>}
        </div>
      </div>

      <div className={s.actions}>
        <Button type="button" variant="outline" size="lg">Save</Button>
        <Button type="button" size="lg" onClick={onDeploy}>Deploy</Button>
      </div>
    </div>
  );
}
