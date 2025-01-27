type DataTypeID =
  | 0x00
  | 0x01
  | 0x02
  | 0x03
  | 0x04
  | 0x05
  | 0x06
  | 0x07
  | 0x08
  | 0x09
  | 0x0a
  | 0x0b
  | 0x0c;

interface Header {
  signature: Buffer;
  version: number;
  reserved: Buffer;
}

interface StaticMetadata {
  sha1: Buffer;
  lastMarkerPos: number;
  noteCount: number;
  markerCount: number;
  difficulty: number;
  rating: number;
  hasAudio: boolean;
  hasCover: boolean;
  requiresMod: boolean;
}

interface Pointers {
  customDataOffset: number;
  customDataLength: number;
  audioOffset: number;
  audioLength: number;
  coverOffset: number;
  coverLength: number;
  markerDefinitionsOffset: number;
  markerDefinitionsLength: number;
  markerOffset: number;
  markerLength: number;
}

interface Strings {
  mapID: string;
  mapName: string;
  songName: string;
  mappers: string[];
}

interface CustomField {
  id: string;
  type: DataTypeID;
  arrayType?: DataTypeID;
  value: any;
}

interface CustomData {
  fields: CustomField[];
}

interface MarkerDefinition {
  id: string;
  values: DataTypeID[];
}

interface Marker {
  position: number;
  type: number;
  data: Buffer;
}

export class SSPMParser {
  private buffer: Buffer;
  private offset: number = 0;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  private checkBounds(length: number): void {
    if (this.offset + length > this.buffer.length) {
      throw new RangeError(
        `Attempt to read beyond buffer length: Offset=${this.offset}, Length=${length}, Buffer Length=${this.buffer.length}`
      );
    }
  }

  private log(message: string): void {
    // console.log(`[Offset: ${this.offset}] ${message}`);
  }

  private readUInt16(): number {
    this.checkBounds(2);
    const value = this.buffer.readUInt16LE(this.offset);
    this.log(`Read UInt16: ${value}`);
    this.offset += 2;
    return value;
  }

  private readUInt32(): number {
    this.checkBounds(4);
    const value = this.buffer.readUInt32LE(this.offset);
    this.log(`Read UInt32: ${value}`);
    this.offset += 4;
    return value;
  }

  private readUInt64(): number {
    this.checkBounds(8);
    const low = this.buffer.readUInt32LE(this.offset);
    const high = this.buffer.readUInt32LE(this.offset + 4);
    this.offset += 8;
    const value = low + high * 2 ** 32;
    this.log(`Read UInt64: ${value} (Low: ${low}, High: ${high})`);
    return value;
  }

  private readBytes(length: number): Buffer {
    this.checkBounds(length);
    const value = this.buffer.slice(this.offset, this.offset + length);
    this.log(`Read ${length} bytes`);
    this.offset += length;
    return value;
  }

  private readString(): string {
    const length = this.readUInt16();
    this.checkBounds(length);
    const value = this.readBytes(length).toString("utf-8");
    this.log(`Read String of length ${length}: ${value}`);
    return value;
  }

  private readStringList(count: number): string[] {
    console.log("[DANGER] Reading String List");
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(this.readString());
    }
    return list;
  }

  private readMarkerField(typeID: DataTypeID): any {
    switch (typeID) {
      case 0x01: // 1 byte integer
        this.checkBounds(1);
        const int8 = this.buffer.readInt8(this.offset++);
        this.log(`Read Int8: ${int8}`);
        return int8;
      case 0x02: // 2 byte uint
        return this.readUInt16();
      case 0x03: // 4 byte uint
        return this.readUInt32();
      case 0x04: // 8 byte uint
        return this.readUInt64();
      case 0x05: // 4 byte float
        this.checkBounds(4);
        const floatVal32 = this.buffer.readFloatLE(this.offset);
        this.log(`Read Float32: ${floatVal32}`);
        this.offset += 4;
        return floatVal32;
      case 0x06: // 8 byte float
        this.checkBounds(8);
        const floatVal64 = this.buffer.readDoubleLE(this.offset);
        this.log(`Read Float64: ${floatVal64}`);
        this.offset += 8;
        return floatVal64;
      case 0x07: // position type
        const isQuantum = this.buffer.readUInt8(this.offset++);
        let posData;
        if (isQuantum === 0x00) {
          this.checkBounds(2);
          const posX = this.buffer.readUInt8(this.offset++);
          const posY = this.buffer.readUInt8(this.offset++);
          this.log(`Read Position Int: x=${posX}, y=${posY}`);
          posData = { x: posX, y: posY, type: "int" };
        } else {
          this.checkBounds(8);
          const posX = this.buffer.readFloatLE(this.offset);
          this.offset += 4;
          const posY = this.buffer.readFloatLE(this.offset);
          this.offset += 4;
          this.log(`Read Position Quantum: x=${posX}, y=${posY}`);
          posData = { x: posX, y: posY, type: "quantum" };
        }
        return posData;
      case 0x08: // buffer
      case 0x09: // string
        const length16 = this.readUInt16();
        this.checkBounds(length16);
        const value = this.readBytes(length16).toString("utf-8");
        this.log(`Read Buffer/String of length ${length16}`);
        return value;
      case 0x0a: // long buffer
      case 0x0b: // long string
        const length32 = this.readUInt32();
        this.log(`Reading Buffer/String of length ${length32}`);
        this.checkBounds(length32);
        const longValue = this.readBytes(length32).toString("utf-8");
        this.log(`Read Long Buffer/String of length ${length32}`);
        return longValue;
      case 0x00: // end type, should not appear here
      default:
        throw new Error("Unexpected DataTypeID in marker definition.");
    }
  }

  private readMarkerData(typeIDs: DataTypeID[]): any {
    const dataObject: any = {};
    for (const [index, typeID] of typeIDs.entries()) {
      dataObject[`field${index}`] = this.readMarkerField(typeID);
    }
    return dataObject;
  }

  parse(): {
    header: Header;
    metadata: StaticMetadata;
    pointers: Pointers;
    strings: Strings;
    customData: CustomData;
    audio?: Buffer;
    cover?: Buffer;
    markerDefinitions: MarkerDefinition[];
    markers: Marker[];
  } {
    // Header
    const header: Header = {
      signature: this.readBytes(4),
      version: this.readUInt16(),
      reserved: this.readBytes(4),
    };
    if (header.version == 1) {
      throw "Can't parse";
    }

    // Static Metadata
    const metadata: StaticMetadata = {
      sha1: this.readBytes(20),
      lastMarkerPos: this.readUInt32(),
      noteCount: this.readUInt32(),
      markerCount: this.readUInt32(),
      difficulty: this.buffer.readUInt8(this.offset++),
      rating: this.readUInt16(),
      hasAudio: this.buffer.readUInt8(this.offset++) === 1,
      hasCover: this.buffer.readUInt8(this.offset++) === 1,
      requiresMod: this.buffer.readUInt8(this.offset++) === 1,
    };

    // Pointers
    const pointers: Pointers = {
      customDataOffset: this.readUInt64(),
      customDataLength: this.readUInt64(),
      audioOffset: this.readUInt64(),
      audioLength: this.readUInt64(),
      coverOffset: this.readUInt64(),
      coverLength: this.readUInt64(),
      markerDefinitionsOffset: this.readUInt64(),
      markerDefinitionsLength: this.readUInt64(),
      markerOffset: this.readUInt64(),
      markerLength: this.readUInt64(),
    };

    // Log derived pointer values
    this.log(`customDataOffset: ${pointers.customDataOffset}`);
    this.log(`customDataLength: ${pointers.customDataLength}`);
    this.log(`audioOffset: ${pointers.audioOffset}`);
    this.log(`audioLength: ${pointers.audioLength}`);
    this.log(`coverOffset: ${pointers.coverOffset}`);
    this.log(`coverLength: ${pointers.coverLength}`);
    this.log(`markerDefinitionsOffset: ${pointers.markerDefinitionsOffset}`);
    this.log(`markerDefinitionsLength: ${pointers.markerDefinitionsLength}`);
    this.log(`markerOffset: ${pointers.markerOffset}`);
    this.log(`markerLength: ${pointers.markerLength}`);

    // Strings
    const strings: Strings = {
      mapID: this.readString(),
      mapName: this.readString(),
      songName: this.readString(),
      mappers: this.readStringList(this.readUInt16()),
    };

    let customData: CustomData = { fields: [] };
    try {
      if (pointers.customDataOffset && pointers.customDataLength) {
        this.log(
          `Reading Custom Data, Offset: ${pointers.customDataOffset}, Length: ${pointers.customDataLength}`
        );
        this.offset = Number(pointers.customDataOffset);
        const fieldCount = this.readUInt16();
        this.log(`Fields: ${fieldCount.toString()}`);
        for (let i = 0; i < fieldCount; i++) {
          const id = this.readString();
          const type = this.buffer.readUInt8(this.offset++) as DataTypeID;
          let arrayType: DataTypeID | undefined;
          if (type === 0x0c) {
            arrayType = this.buffer.readUInt8(this.offset++) as DataTypeID;
          }
          const length = this.readUInt32();
          // this.checkBounds(length);
          const value = this.readBytes(length);
          customData.fields.push({ id, type, arrayType, value });
        }
      }
    } catch (error) {}

    let audio: Buffer | undefined;
    if (
      metadata.hasAudio &&
      pointers.audioOffset != 0 &&
      pointers.audioLength != 0
    ) {
      this.log(
        `Reading Audio Data, Offset: ${pointers.audioOffset}, Length: ${pointers.audioLength}`
      );
      this.offset = Number(pointers.audioOffset);
      this.checkBounds(Number(pointers.audioLength));
      audio = this.readBytes(Number(pointers.audioLength));
    }

    let cover: Buffer | undefined;
    if (
      metadata.hasCover &&
      pointers.coverOffset != 0 &&
      pointers.coverLength != 0
    ) {
      this.log(
        `Reading Cover Data, Offset: ${pointers.coverOffset}, Length: ${pointers.coverLength}`
      );
      this.offset = Number(pointers.coverOffset);
      this.checkBounds(Number(pointers.coverLength));
      cover = this.readBytes(Number(pointers.coverLength));
    }

    // Marker Definitions
    this.log(
      `Reading Marker Definitions, Offset: ${pointers.markerDefinitionsOffset}, Length: ${pointers.markerDefinitionsLength}`
    );
    this.offset = Number(pointers.markerDefinitionsOffset);
    const markerDefCount = this.buffer.readUInt8(this.offset++);
    const markerDefinitions: MarkerDefinition[] = [];
    for (let i = 0; i < markerDefCount; i++) {
      const id = this.readString();
      const valueCount = this.buffer.readUInt8(this.offset++);
      const values: DataTypeID[] = [];
      for (let j = 0; j < valueCount; j++) {
        values.push(this.buffer.readUInt8(this.offset++) as DataTypeID);
      }
      markerDefinitions.push({ id, values });
    }

    // Markers
    this.log(
      `Reading Markers, Offset: ${pointers.markerOffset}, Length: ${pointers.markerLength}`
    );
    this.offset = Number(pointers.markerOffset);
    const endOffset = this.offset + Number(pointers.markerLength);

    const markers: Marker[] = [];

    while (this.offset < endOffset) {
      const position = this.readUInt32();
      const type = this.buffer.readUInt8(this.offset++);
      const def = markerDefinitions.find((d) => d.id === "ssp_note"); // Adjust as needed for other marker types
      const data = def ? this.readMarkerData(def.values) : {};
      markers.push({ position, type, data });
    }

    return {
      header,
      metadata,
      pointers,
      strings,
      customData,
      audio,
      cover,
      markerDefinitions,
      markers,
    };
  }
}

export type SSPMParsedMap = {
  header: Header;
  metadata: StaticMetadata;
  pointers: Pointers;
  strings: Strings;
  customData: CustomData;
  audio?: Buffer;
  cover?: Buffer;
  markerDefinitions: MarkerDefinition[];
  markers: Marker[];
};
