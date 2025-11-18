import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  Length,
  Matches,
} from 'class-validator';

export class AssignTestToStudentDto {
  @IsUUID()
  student_id: string;

  @IsUUID()
  test_id: string;

  @IsOptional()
  @IsDateString()
  test_start_time?: string;

  @IsOptional()
  @IsDateString()
  test_end_time?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAssignedTestDto {
  @IsOptional()
  @IsDateString()
  test_start_time?: string;

  @IsOptional()
  @IsDateString()
  test_end_time?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'expired'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StudentLoginDto {
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]{10}$/, { message: 'Candidate ID must be exactly 10 digits' })
  candidate_id: string;
}

export class SubmitTestResultDto {
  @IsOptional()
  test_results?: any;
}
