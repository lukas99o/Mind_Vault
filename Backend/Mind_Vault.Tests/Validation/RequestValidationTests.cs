using System.ComponentModel.DataAnnotations;
using FluentAssertions;
using Mind_Vault.Api.Models.Dtos;

namespace Mind_Vault.Tests.Validation;

public sealed class RequestValidationTests
{
    [Fact]
    public void BookQueryRequest_WhenPageValuesAreInvalid_ReturnsRangeValidationErrors()
    {
        var request = new BookQueryRequest
        {
            PageNumber = 0,
            PageSize = 0
        };

        var validationResults = Validate(request);

        validationResults.Should().Contain(result => result.MemberNames.Contains(nameof(BookQueryRequest.PageNumber)));
        validationResults.Should().Contain(result => result.MemberNames.Contains(nameof(BookQueryRequest.PageSize)));
    }

    [Fact]
    public void BookQueryRequest_WhenPublicationDateRangeIsReversed_ReturnsCustomValidationError()
    {
        var request = new BookQueryRequest
        {
            PublicationDateFrom = new DateTime(2025, 1, 2),
            PublicationDateTo = new DateTime(2025, 1, 1)
        };

        var validationResults = Validate(request);

        validationResults.Should().ContainSingle(result =>
            result.MemberNames.Contains(nameof(BookQueryRequest.PublicationDateFrom)) &&
            result.MemberNames.Contains(nameof(BookQueryRequest.PublicationDateTo)) &&
            result.ErrorMessage == "PublicationDateFrom must be earlier than or equal to PublicationDateTo.");
    }

    [Fact]
    public void LoginRequest_WhenEmailAndPasswordAreInvalid_ReturnsValidationErrors()
    {
        var request = new LoginRequest
        {
            Email = "not-an-email",
            Password = "short"
        };

        var validationResults = Validate(request);

        validationResults.Should().Contain(result => result.MemberNames.Contains(nameof(LoginRequest.Email)));
        validationResults.Should().Contain(result => result.MemberNames.Contains(nameof(LoginRequest.Password)));
    }

    [Fact]
    public void RegisterRequest_WhenRequiredFieldsAreMissing_ReturnsValidationErrors()
    {
        var request = new RegisterRequest
        {
            Email = string.Empty,
            Password = string.Empty
        };

        var validationResults = Validate(request);

        validationResults.Should().Contain(result => result.MemberNames.Contains(nameof(RegisterRequest.Email)));
        validationResults.Should().Contain(result => result.MemberNames.Contains(nameof(RegisterRequest.Password)));
    }

    private static List<ValidationResult> Validate<T>(T instance)
    {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(instance!);

        Validator.TryValidateObject(instance!, validationContext, validationResults, validateAllProperties: true);

        return validationResults;
    }
}