import randomstring from 'randomstring';

export function createLobby(): string {
    const roomId = roomIdGen();
    return roomId;
}

const roomIdGen = (): string => randomstring.generate({length: 6, charset: ['numeric']});
