enum Difficulty {
  NA = 0x00,
  Easy = 0x01,
  Medium = 0x02,
  Hard = 0x03,
  Logic = 0x04,
  Tasukete = 0x05,
}

enum CoverStorageType {
  None = 0x00,
  PNG = 0x02,
}

enum AudioStorageType {
  None = 0x00,
  StoredAudioFile = 0x01,
}

enum NoteStorageType {
  Integer = 0x00,
  Quantum = 0x01,
}

interface Note {
  position: number;
  x: number;
  y: number;
}

export interface SSPMMap {
  id: string;
  name: string;
  creator: string;
  lastNotePosition: number;
  noteCount: number;
  difficulty: Difficulty;
  cover: Buffer | null;
  audio: Buffer | null;
  notes: Note[];
}

export class V1SSPMParser {
  private buffer: Buffer;
  private offset: number = 0;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  parse(): SSPMMap {
    this.validateHeader();
    const metadata = this.parseMetadata();
    const cover = this.parseCover();
    const audio = this.parseAudio();
    const notes = this.parseNotes(metadata.noteCount);

    return {
      ...metadata,
      cover,
      audio,
      notes,
    };
  }

  private validateHeader() {
    const signature = this.buffer.slice(0, 4).toString("hex");
    if (signature !== "53532b6d") {
      throw new Error("Invalid SSPM file signature");
    }

    const version = this.buffer.readUInt16LE(4);
    if (version !== 1) {
      throw new Error(`Unsupported SSPM version: ${version}`);
    }

    this.offset = 8; // Skip reserved space
  }

  private parseMetadata(): Omit<SSPMMap, "cover" | "audio" | "notes"> {
    const id = this.readString();
    const name = this.readString();
    const creator = this.readString();
    const lastNotePosition = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    const noteCount = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    const difficulty = this.buffer.readUInt8(this.offset++) as Difficulty;

    return { id, name, creator, lastNotePosition, noteCount, difficulty };
  }

  private parseCover(): Buffer | null {
    const coverType = this.buffer.readUInt8(this.offset++) as CoverStorageType;
    if (coverType === CoverStorageType.None) {
      return null;
    } else if (coverType === CoverStorageType.PNG) {
      const length = this.buffer.readBigUInt64LE(this.offset);
      this.offset += 8;
      const cover = this.buffer.slice(
        this.offset,
        this.offset + Number(length)
      );
      this.offset += Number(length);
      return cover;
    } else {
      throw new Error(`Unsupported cover storage type: ${coverType}`);
    }
  }

  private parseAudio(): Buffer | null {
    const audioType = this.buffer.readUInt8(this.offset++) as AudioStorageType;
    if (audioType === AudioStorageType.None) {
      return null;
    } else if (audioType === AudioStorageType.StoredAudioFile) {
      const length = this.buffer.readBigUInt64LE(this.offset);
      this.offset += 8;
      const audio = this.buffer.slice(
        this.offset,
        this.offset + Number(length)
      );
      this.offset += Number(length);
      return audio;
    } else {
      throw new Error(`Unsupported audio storage type: ${audioType}`);
    }
  }

  private parseNotes(count: number): Note[] {
    const notes: Note[] = [];
    for (let i = 0; i < count; i++) {
      const position = this.buffer.readUInt32LE(this.offset);
      this.offset += 4;
      const storageType = this.buffer.readUInt8(
        this.offset++
      ) as NoteStorageType;

      let x: number, y: number;
      if (storageType === NoteStorageType.Integer) {
        x = this.buffer.readUInt8(this.offset++);
        y = this.buffer.readUInt8(this.offset++);
      } else if (storageType === NoteStorageType.Quantum) {
        x = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        y = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
      } else {
        throw new Error(`Unsupported note storage type: ${storageType}`);
      }

      notes.push({ position, x, y });
    }
    return notes;
  }

  private readString(): string {
    let end = this.offset;
    while (this.buffer[end] !== 0x0a) {
      end++;
    }
    const str = this.buffer.slice(this.offset, end).toString("utf-8");
    this.offset = end + 1;
    return str;
  }
}
