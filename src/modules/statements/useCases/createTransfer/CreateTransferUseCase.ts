import { inject, injectable } from "tsyringe";

import { Statement } from "modules/statements/entities/Statement";
import { IStatementsRepository } from "modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "modules/users/repositories/IUsersRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";

interface IRequest {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, receiver_id, amount, description }: IRequest): Promise<Statement> {
    const receiverExists = await this.usersRepository.findById(receiver_id);

    if (!receiverExists) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds()
    }

    const transfer = await this.statementsRepository.create({
      user_id: receiver_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description
    });

    return transfer;
  }
}

export { CreateTransferUseCase };
