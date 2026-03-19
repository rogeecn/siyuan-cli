export interface ConfirmationOptions {
  yes?: boolean;
}

export type ConfirmationHandler = () => Promise<boolean>;

export async function requestConfirmation(
  options: ConfirmationOptions,
  confirm: ConfirmationHandler,
) {
  if (options.yes) {
    return;
  }

  const accepted = await confirm();

  if (!accepted) {
    throw new Error('Command aborted by user');
  }
}
