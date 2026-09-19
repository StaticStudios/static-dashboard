import {initials} from "../../lib/utils";
import {PlayerAvatar} from "./PlayerAvatar";
import {PlayerLink} from "./PlayerLink";
import type {TicketPerson} from "../api/types";

/**
 * A person from a ticket transcript.
 *
 * <p>Transcripts name everyone by Discord snowflake. Where the API resolved one to a linked
 * Minecraft account this renders the same head, name and profile link the rest of the dashboard
 * uses; where it could not, it falls back to the Discord name so an unlinked account still reads as
 * a person rather than a number.
 */
export function TicketPersonLabel({
  person,
  seed = 0,
}: {
  person: TicketPerson | null;
  seed?: number;
}) {
  if (!person) {
    return <span className="text-xs font-mono text-muted-foreground">—</span>;
  }

  const label = person.playerName ?? person.username ?? person.snowflake;
  const avatar = (
    <PlayerAvatar initials={initials(label)} seed={seed} skinTextureValue={person.skinTextureValue} />
  );

  if (person.playerId && person.playerName) {
    return (
      <PlayerLink id={person.playerId} name={person.playerName} className="gap-2.5">
        {avatar}
        <span className="text-xs font-mono text-foreground whitespace-nowrap">{person.playerName}</span>
      </PlayerLink>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {avatar}
      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}
