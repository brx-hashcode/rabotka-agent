"use client";

import { useState } from "react";
import { IconChevronLeft, IconMap2, IconX } from "@tabler/icons-react";

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

      <PopoverContent align="start" sideOffset={14} className="w-80 p-0">
        <Command>
          {country ? (
            <>
              <button
                type="button"
                onClick={() => setCountry("")}
                className="flex w-full items-center gap-1 px-3 pt-3 pb-1 text-muted-foreground text-xs hover:text-foreground"
              >
                <IconChevronLeft className="size-3.5" />
                Changer de pays
              </button>
              <CommandInput placeholder="Rechercher une ville" />
              <CommandList>
                <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => pick({ country, city: "" })}>
                    Tout le pays
                  </CommandItem>
                  {cities.data?.map((city) => (
                    <CommandItem key={city} value={city} onSelect={() => pick({ country, city })}>
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </>
          ) : (
            <>
              <CommandInput placeholder="Rechercher un pays" />
              <CommandList>
                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                <CommandGroup>
                  {countries.data?.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      onSelect={() => setCountry(c.code)}
                    >
                      {c.name}
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
