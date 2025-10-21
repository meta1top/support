import { register } from "@meta-1/design";

register({
  // biome-ignore lint/suspicious/noExplicitAny: join
  join: (v: any[], s = ", ") => {
    return v ? v.join(s) : v;
  },
});
