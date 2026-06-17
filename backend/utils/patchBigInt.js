export default function patchBigInt() {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}