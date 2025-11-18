import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetStudent = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const student = request.student;

    if (!student) {
      return null;
    }

    return data ? student[data] : student;
  },
);
