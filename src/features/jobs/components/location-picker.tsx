"use client";

import { useState } from "react";
import { IconCheck, IconChevronLeft, IconMap2, IconX } from "@tabler/icons-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { useCities, useCountries } from "#/hooks/use-geo";

export type Place = { country: string; city: string };

/**
 * Styled like the hero's search pill: borderless, rounded, soft shadow, with a
 * pill-shaped search field. The list scrolls inside the popup and never hands
 * the wheel over to the page (`overscroll-contain`).
 */
const COMMAND_STYLE =
  "bg-transparent [&_[data-slot=command-input-wrapper]]:mb-2 [&_[data-slot=command-input-wrapper]]:h-11 [&_[data-slot=command-input-wrapper]]:rounded-full [&_[data-slot=command-input-wrapper]]:border-0 [&_[data-slot=command-input-wrapper]]:bg-muted [&_[data-slot=command-input-wrapper]]:px-4";
const LIST_STYLE = "max-h-64 overscroll-contain pr-1";
const ITEM_STYLE =
  "cursor-pointer justify-between rounded-xl px-3 py-2.5 text-[15px] data-[selected=true]:bg-muted";

function Selected({ on }: Readonly<{ on: boolean }>) {
  return on ? <IconCheck className="size-4 text-whatsapp-dark" /> : null;
}

/**
 * "Ajouter un pays ou une ville": pick a country, then optionally one of its
 * cities (both from the backend's public geo lists).
 */
export function LocationPicker({
  value,
  onChange,
}: Readonly<{ value: Place; onChange: (place: Place) => void }>) {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(value.country);
  const countries = useCountries();
  const cities = useCities(country);

  const countryName = countries.data?.find((c) => c.code === value.country)?.name;
  const label = value.city
    ? `${value.city}${countryName ? `, ${countryName}` : ""}`
    : countryName;

  function pick(place: Place) {
    onChange(place);
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setCountry(value.country);
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <IconMap2 className="size-5 shrink-0 text-muted-foreground" />
        <PopoverTrigger
          className="min-w-0 flex-1 truncate py-2 text-left text-[15px] outline-none"
          aria-label="Lieu"
        >
          {label ?? <span className="text-muted-foreground">Ajouter un pays ou une ville</span>}
        </PopoverTrigger>
        {label && (
          <button
            type="button"
            onClick={() => onChange({ country: "", city: "" })}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Effacer le lieu"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>

      <PopoverContent
        align="start"
        sideOffset={18}
        className="w-80 rounded-3xl border-0 bg-card shadow-soft before:hidden"
      >
        <Command className={COMMAND_STYLE}>
          {country ? (
            <>
              <button
                type="button"
                onClick={() => setCountry("")}
                className="mb-2 flex items-center gap-1 self-start rounded-full px-2 py-1 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
              >
                <IconChevronLeft className="size-3.5" />
                Changer de pays
              </button>
              <CommandInput placeholder="Rechercher une ville" />
              <CommandList className={LIST_STYLE}>
                <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    className={ITEM_STYLE}
                    onSelect={() => pick({ country, city: "" })}
                  >
                    Tout le pays
                    <Selected on={value.country === country && !value.city} />
                  </CommandItem>
                  {cities.data?.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      className={ITEM_STYLE}
                      onSelect={() => pick({ country, city })}
                    >
                      {city}
                      <Selected on={value.country === country && value.city === city} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </>
          ) : (
            <>
              <CommandInput placeholder="Rechercher un pays" />
              <CommandList className={LIST_STYLE}>
                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                <CommandGroup>
                  {countries.data?.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      className={ITEM_STYLE}
                      onSelect={() => setCountry(c.code)}
                    >
                      {c.name}
                      <Selected on={value.country === c.code} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
